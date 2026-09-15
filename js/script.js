/* ============================================================
   Stackly - Multipurpose Business Solutions
   Main JavaScript File
   ============================================================ */

(function () {
    "use strict";

    /* ==========================================================
       17. Page Load Fade-In Effect
       ========================================================== */
    document.body.classList.add("page-loaded");

    document.addEventListener("DOMContentLoaded", function () {

        /* ======================================================
           1. DOM Ready - Body visible
           ====================================================== */
        document.body.classList.add("ready");

        /* ======================================================
           2. Navbar
           ====================================================== */
        const navbar = document.querySelector(".navbar");
        const hamburger = document.querySelector(".hamburger");
        const navMenu = document.querySelector(".nav-menu");
        const navLinks = document.querySelectorAll(".nav-link");

        function handleNavbarScroll() {
            if (!navbar) return;
            if (window.scrollY > 50) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        }

        window.addEventListener("scroll", handleNavbarScroll);
        handleNavbarScroll();

        if (hamburger && navMenu) {
            hamburger.addEventListener("click", function () {
                hamburger.classList.toggle("active");
                navMenu.classList.toggle("active");
            });
        }

        function closeMobileMenu() {
            if (hamburger) hamburger.classList.remove("active");
            if (navMenu) navMenu.classList.remove("active");
        }

        navLinks.forEach(function (link) {
            link.addEventListener("click", closeMobileMenu);
        });

        function highlightActiveNavLink() {
            var currentPath = window.location.pathname.split("/").pop() || "index.html";
            navLinks.forEach(function (link) {
                var href = link.getAttribute("href");
                if (href) {
                    var linkPath = href.split("/").pop();
                    if (linkPath === currentPath) {
                        link.classList.add("active");
                    } else {
                        link.classList.remove("active");
                    }
                }
            });
        }

        highlightActiveNavLink();

        /* ======================================================
           3. Scroll Reveal
           ====================================================== */
        var scrollRevealElements = document.querySelectorAll(".scroll-reveal");

        if ("IntersectionObserver" in window && scrollRevealElements.length) {
            var scrollRevealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        scrollRevealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            scrollRevealElements.forEach(function (el) {
                scrollRevealObserver.observe(el);
            });
        } else {
            scrollRevealElements.forEach(function (el) {
                el.classList.add("revealed");
            });
        }

        /* ======================================================
           4. Animated Counters
           ====================================================== */
        function formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        function animateCounter(el, target, duration) {
            var start = 0;
            var startTime = null;
            var suffix = el.getAttribute("data-suffix") || "";
            var prefix = el.getAttribute("data-prefix") || "";

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = Math.floor(eased * target);
                el.textContent = prefix + formatNumber(current) + suffix;
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    el.textContent = prefix + formatNumber(target) + suffix;
                }
            }

            requestAnimationFrame(step);
        }

        var statNumbers = document.querySelectorAll(".stat-number, .counter");

        if ("IntersectionObserver" in window && statNumbers.length) {
            var counterObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var el = entry.target;
                        var target = parseInt(el.getAttribute("data-target") || el.textContent.replace(/[^0-9]/g, ""), 10);
                        if (!isNaN(target)) {
                            animateCounter(el, target, 2000);
                        }
                        counterObserver.unobserve(el);
                    }
                });
            }, { threshold: 0.15 });

            statNumbers.forEach(function (el) {
                counterObserver.observe(el);
            });
        } else {
            statNumbers.forEach(function (el) {
                var target = parseInt(el.getAttribute("data-target") || el.textContent.replace(/[^0-9]/g, ""), 10);
                if (!isNaN(target)) {
                    el.textContent = formatNumber(target);
                }
            });
        }

        /* ======================================================
           5. Pie Chart (Canvas) - Donut Style
           ====================================================== */
        window.drawPieChart = function (canvasId, data, options) {
            var canvas = document.getElementById(canvasId);
            if (!canvas || !canvas.getContext) return;

            var ctx = canvas.getContext("2d");
            var dpr = window.devicePixelRatio || 1;
            var displayWidth = options && options.width ? options.width : canvas.parentElement ? canvas.parentElement.offsetWidth : 300;
            var displayHeight = options && options.height ? options.height : displayWidth;

            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;
            canvas.style.width = displayWidth + "px";
            canvas.style.height = displayHeight + "px";
            ctx.scale(dpr, dpr);

            var centerX = displayWidth / 2;
            var centerY = displayHeight / 2;
            var radius = Math.min(centerX, centerY) - 20;
            var innerRadius = options && options.innerRadius !== undefined ? options.innerRadius : radius * 0.55;

            var total = 0;
            data.forEach(function (item) {
                total += item.value;
            });

            if (total === 0) return;

            var animationProgress = 0;
            var animationDuration = options && options.duration ? options.duration : 1000;
            var startTime = null;

            function easeOutCubic(t) {
                return 1 - Math.pow(1 - t, 3);
            }

            function drawFrame(timestamp) {
                if (!startTime) startTime = timestamp;
                var elapsed = timestamp - startTime;
                animationProgress = Math.min(elapsed / animationDuration, 1);
                var currentAngle = -Math.PI / 2;
                var easedProgress = easeOutCubic(animationProgress);
                var sweepAngle = Math.PI * 2 * easedProgress;

                ctx.clearRect(0, 0, displayWidth, displayHeight);

                var sliceAngles = [];
                data.forEach(function (item) {
                    sliceAngles.push((item.value / total) * Math.PI * 2);
                });

                var drawnSoFar = 0;

                for (var i = 0; i < data.length; i++) {
                    var sliceAngle = sliceAngles[i];
                    var drawAngle = Math.min(sliceAngle, Math.max(0, sweepAngle - drawnSoFar));

                    if (drawAngle <= 0) break;

                    ctx.beginPath();
                    ctx.moveTo(
                        centerX + innerRadius * Math.cos(currentAngle),
                        centerY + innerRadius * Math.sin(currentAngle)
                    );
                    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + drawAngle, false);
                    ctx.arc(centerX, centerY, innerRadius, currentAngle + drawAngle, currentAngle, true);
                    ctx.closePath();
                    ctx.fillStyle = data[i].color;
                    ctx.fill();

                    if (animationProgress >= 1) {
                        var midAngle = currentAngle + sliceAngle / 2;
                        var labelRadius = radius - (radius - innerRadius) / 2 - 10;
                        var labelX = centerX + labelRadius * Math.cos(midAngle);
                        var labelY = centerY + labelRadius * Math.sin(midAngle);
                        var pct = ((data[i].value / total) * 100).toFixed(1) + "%";

                        ctx.fillStyle = "#fff";
                        ctx.font = "bold 11px Arial, sans-serif";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(pct, labelX, labelY);
                    }

                    currentAngle += drawAngle;
                    drawnSoFar += sliceAngle;
                }

                if (animationProgress >= 1) {
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
                    ctx.fillStyle = options && options.centerColor ? options.centerColor : "#ffffff";
                    ctx.fill();

                    if (options && options.centerText) {
                        ctx.fillStyle = options.centerTextColor || "#333333";
                        ctx.font = options.centerTextFont || "bold 18px Arial, sans-serif";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(options.centerText, centerX, centerY);
                    }

                    if (options && options.legend !== false) {
                        var legendY = displayHeight - 15;
                        var legendX = 10;
                        ctx.font = "11px Arial, sans-serif";
                        data.forEach(function (item) {
                            ctx.fillStyle = item.color;
                            ctx.fillRect(legendX, legendY - 8, 10, 10);
                            ctx.fillStyle = "#555";
                            ctx.textAlign = "left";
                            ctx.textBaseline = "middle";
                            ctx.fillText(item.label, legendX + 14, legendY - 3);
                            legendX += ctx.measureText(item.label).width + 30;
                        });
                    }

                    return;
                }

                requestAnimationFrame(drawFrame);
            }

            requestAnimationFrame(drawFrame);
        };

        /* ======================================================
           6. Login Page
           ====================================================== */
        var loginForm = document.getElementById("loginForm");

        if (loginForm) {
            var emailInput = document.getElementById("loginEmail");
            var passwordInput = document.getElementById("loginPassword");
            var rememberMe = document.getElementById("rememberMe");
            var passwordToggle = document.getElementById("togglePassword") || document.querySelector(".password-toggle");

            function validateLoginEmail(email) {
                var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return re.test(email);
            }

            function setFieldState(field, isValid, message) {
                var group = field.closest(".form-group");
                if (!group) return;

                var errorEl = group.querySelector(".error-message");
                group.classList.remove("error", "success");

                if (isValid) {
                    group.classList.add("success");
                    if (errorEl) errorEl.textContent = "";
                } else {
                    group.classList.add("error");
                    if (errorEl) errorEl.textContent = message;
                }
            }

            if (passwordToggle && passwordInput) {
                passwordToggle.addEventListener("click", function () {
                    var isPassword = passwordInput.type === "password";
                    passwordInput.type = isPassword ? "text" : "password";
                    this.classList.toggle("active");
                    var icon = this.querySelector("i");
                    if (icon) {
                        icon.classList.toggle("uil-eye");
                        icon.classList.toggle("uil-eye-slash");
                    }
                });
            }

            loginForm.addEventListener("submit", function (e) {
                e.preventDefault();

                var email = emailInput ? emailInput.value.trim() : "";
                var password = passwordInput ? passwordInput.value : "";
                var isValid = true;

                if (!email) {
                    setFieldState(emailInput, false, "Email is required");
                    isValid = false;
                } else if (!validateLoginEmail(email)) {
                    setFieldState(emailInput, false, "Please enter a valid email address");
                    isValid = false;
                } else {
                    setFieldState(emailInput, true, "");
                }

                if (!password) {
                    setFieldState(passwordInput, false, "Password is required");
                    isValid = false;
                } else if (password.length < 6) {
                    setFieldState(passwordInput, false, "Password must be at least 6 characters");
                    isValid = false;
                } else {
                    setFieldState(passwordInput, true, "");
                }

                if (!isValid) return;

                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userEmail", email);

                if (rememberMe && rememberMe.checked) {
                    localStorage.setItem("rememberedEmail", email);
                } else {
                    localStorage.removeItem("rememberedEmail");
                }

                showToast("Login successful! Welcome to Stackly.", "success");

                setTimeout(function () {
                    window.location.href = "dashboard.html";
                }, 2000);
            });
        }

        /* ======================================================
           7. Signup Page
           ====================================================== */
        var signupForm = document.getElementById("signupForm");

        if (signupForm) {
            var fullNameInput = document.getElementById("signupName");
            var signupEmailInput = document.getElementById("signupEmail");
            var phoneInput = document.getElementById("signupPhone");
            var signupPasswordInput = document.getElementById("signupPassword");
            var confirmPasswordInput = document.getElementById("signupConfirmPassword");
            var termsCheckbox = document.getElementById("termsCheckbox");
            var signupPasswordToggle = document.querySelector(".signup-password-toggle");
            var signupToggles = document.querySelectorAll(".signup-toggle");

            function setSignupFieldState(field, isValid, message) {
                var group = field.closest(".form-group");
                if (!group) return;

                var errorEl = group.querySelector(".error-message");
                group.classList.remove("error", "success");

                if (isValid) {
                    group.classList.add("success");
                    if (errorEl) errorEl.textContent = "";
                } else {
                    group.classList.add("error");
                    if (errorEl) errorEl.textContent = message;
                }
            }

            function toggleSignupPasswordVisibility(btn, input) {
                var isPassword = input.type === "password";
                input.type = isPassword ? "text" : "password";
                var icon = btn.querySelector("i");
                if (icon) {
                    icon.classList.toggle("uil-eye");
                    icon.classList.toggle("uil-eye-slash");
                }
            }

            if (signupToggles.length) {
                signupToggles.forEach(function (btn) {
                    var inputId = btn.id === "toggleSignupPassword" ? "signupPassword"
                        : btn.id === "toggleConfirmPassword" ? "signupConfirmPassword" : null;
                    var input = inputId ? document.getElementById(inputId) : null;
                    if (input) {
                        btn.addEventListener("click", function () {
                            toggleSignupPasswordVisibility(btn, input);
                        });
                    }
                });
            }

            signupForm.addEventListener("submit", function (e) {
                e.preventDefault();

                var fullName = fullNameInput ? fullNameInput.value.trim() : "";
                var email = signupEmailInput ? signupEmailInput.value.trim() : "";
                var phone = phoneInput ? phoneInput.value.trim() : "";
                var password = signupPasswordInput ? signupPasswordInput.value : "";
                var confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";
                var termsChecked = termsCheckbox ? termsCheckbox.checked : false;
                var isValid = true;
                var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!fullName || fullName.length < 2) {
                    setSignupFieldState(fullNameInput, false, "Full name must be at least 2 characters");
                    isValid = false;
                } else {
                    setSignupFieldState(fullNameInput, true, "");
                }

                if (!email || !emailRe.test(email)) {
                    setSignupFieldState(signupEmailInput, false, "Please enter a valid email address");
                    isValid = false;
                } else {
                    setSignupFieldState(signupEmailInput, true, "");
                }

                var digitsOnly = phone.replace(/\D/g, "");
                if (!phone || digitsOnly.length < 10) {
                    setSignupFieldState(phoneInput, false, "Phone number must have at least 10 digits");
                    isValid = false;
                } else {
                    setSignupFieldState(phoneInput, true, "");
                }

                if (!password || password.length < 6) {
                    setSignupFieldState(signupPasswordInput, false, "Password must be at least 6 characters");
                    isValid = false;
                } else {
                    setSignupFieldState(signupPasswordInput, true, "");
                }

                if (password !== confirmPassword) {
                    setSignupFieldState(confirmPasswordInput, false, "Passwords do not match");
                    isValid = false;
                } else {
                    setSignupFieldState(confirmPasswordInput, true, "");
                }

                var termsGroup = termsCheckbox ? termsCheckbox.closest(".form-group") : null;
                if (!termsChecked) {
                    if (termsGroup) {
                        termsGroup.classList.add("error");
                        var termErr = termsGroup.querySelector(".error-message");
                        if (termErr) {
                            termErr.textContent = "You must accept the terms and conditions";
                        }
                    }
                    isValid = false;
                } else if (termsGroup) {
                    termsGroup.classList.remove("error");
                    var termErrRm = termsGroup.querySelector(".error-message");
                    if (termErrRm) termErrRm.textContent = "";
                }

                if (!isValid) return;

                localStorage.setItem("userName", fullName);
                localStorage.setItem("userEmail", email);
                localStorage.setItem("userPhone", phone);

                showToast("Account created! Redirecting to login...", "success");

                setTimeout(function () {
                    window.location.href = "login.html";
                }, 2000);
            });
        }

        /* ======================================================
           8. Dashboard Auth Check
           ====================================================== */
        var dashboardWrapper = document.querySelector(".dashboard-layout");

        if (dashboardWrapper) {
            var isLoggedIn = localStorage.getItem("isLoggedIn");

            if (!isLoggedIn || isLoggedIn !== "true") {
                window.location.href = "login.html";
                return;
            }

            var userEmail = localStorage.getItem("userEmail") || "user@stackly.com";
            var username = userEmail.split("@")[0] || "User";
            var capitalisedName = username.charAt(0).toUpperCase() + username.slice(1);

            var welcomeEl = document.getElementById("welcomeHeading");
            var emailDisplayEl = document.getElementById("welcomeEmail");

            if (welcomeEl) welcomeEl.textContent = "Welcome back, " + capitalisedName + "!";
            if (emailDisplayEl) emailDisplayEl.textContent = "Email: " + userEmail;

            var sidebarAvatar = document.getElementById("sidebarAvatar");
            var topbarAvatar = document.getElementById("topbarAvatar");
            var sidebarUserEmail = document.getElementById("sidebarUserEmail");
            var topbarUser = document.querySelector(".topbar-user-name strong");

            if (sidebarAvatar) sidebarAvatar.textContent = capitalisedName.charAt(0);
            if (topbarAvatar) topbarAvatar.textContent = capitalisedName.charAt(0);
            if (sidebarUserEmail) sidebarUserEmail.textContent = userEmail;
            if (topbarUser) topbarUser.textContent = capitalisedName;
        }

        /* ======================================================
           9. Sidebar Toggle
           ====================================================== */
        var sidebar = document.querySelector(".sidebar");
        var sidebarOverlay = document.querySelector(".sidebar-overlay");
        var sidebarToggle = document.getElementById("mobileSidebarToggle") || document.querySelector(".sidebar-toggle");
        var sidebarClose = document.getElementById("sidebarClose");

        function updateSidebarToggle() {
            if (!sidebarToggle) return;
            var icon = sidebarToggle.querySelector("i");
            var isOpen = sidebar && sidebar.classList.contains("active");
            if (icon) {
                icon.className = isOpen ? "uil uil-times" : "uil uil-bars";
            }
            sidebarToggle.classList.toggle("is-open", isOpen);
            sidebarToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            sidebarToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
        }

        function toggleSidebar() {
            if (sidebar) sidebar.classList.toggle("active");
            if (sidebarOverlay) sidebarOverlay.classList.toggle("active");
            updateSidebarToggle();
        }

        function closeSidebar() {
            if (sidebar) sidebar.classList.remove("active");
            if (sidebarOverlay) sidebarOverlay.classList.remove("active");
            updateSidebarToggle();
        }

        if (sidebarToggle) {
            sidebarToggle.setAttribute("aria-expanded", "false");
            sidebarToggle.addEventListener("click", toggleSidebar);
        }

        if (sidebarClose) {
            sidebarClose.addEventListener("click", closeSidebar);
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener("click", closeSidebar);
        }

        function highlightActiveSidebarItem() {
            var sidebarLinks = document.querySelectorAll(".sidebar-item");
            var currentPage = window.location.pathname.split("/").pop() || "dashboard.html";

            sidebarLinks.forEach(function (link) {
                var href = link.getAttribute("href");
                if (href) {
                    var linkPage = href.split("/").pop();
                    if (linkPage === currentPage) {
                        link.classList.add("active");
                    } else {
                        link.classList.remove("active");
                    }
                }
            });
        }

        highlightActiveSidebarItem();

        /* ======================================================
           10. Logout
           ====================================================== */
        var logoutBtn = document.querySelector(".logout-btn") || document.getElementById("logoutBtn");
        var logoutModal = document.getElementById("logoutModal") || document.querySelector(".modal-overlay.logout-modal");
        var logoutConfirm = document.getElementById("confirmLogout") || document.querySelector(".logout-confirm");
        var logoutCancel = document.getElementById("cancelLogout") || document.querySelector(".logout-cancel");

        if (logoutBtn && logoutModal) {
            logoutBtn.addEventListener("click", function (e) {
                e.preventDefault();
                logoutModal.classList.add("active");
            });

            if (logoutConfirm) {
                logoutConfirm.addEventListener("click", function () {
                    localStorage.removeItem("isLoggedIn");
                    localStorage.removeItem("userEmail");
                    localStorage.removeItem("userName");
                    localStorage.removeItem("userPhone");
                    window.location.href = "login.html";
                });
            }

            if (logoutCancel) {
                logoutCancel.addEventListener("click", function () {
                    logoutModal.classList.remove("active");
                });
            }

            logoutModal.addEventListener("click", function (e) {
                if (e.target === logoutModal) {
                    logoutModal.classList.remove("active");
                }
            });
        }

        /* ======================================================
           11. Contact Form
           ====================================================== */
        var contactForm = document.getElementById("contactForm");

        if (contactForm) {
            contactForm.addEventListener("submit", function (e) {
                e.preventDefault();

                var nameField = contactForm.querySelector('[name="name"]') || document.getElementById("contactName");
                var emailField = contactForm.querySelector('[name="email"]') || document.getElementById("contactEmail");
                var phoneField = contactForm.querySelector('[name="phone"]') || document.getElementById("contactPhone");
                var messageField = contactForm.querySelector('[name="message"]') || document.getElementById("contactMessage");
                var isValid = true;
                var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                function validateContactField(field, condition, errorMsg) {
                    if (!field) return true;
                    var group = field.closest(".form-group");
                    if (group) group.classList.remove("error", "success");

                    var errEl = group ? group.querySelector(".error-message") : null;

                    if (!condition) {
                        if (group) {
                            group.classList.add("error");
                            if (errEl) errEl.textContent = errorMsg;
                        }
                        return false;
                    } else {
                        if (group) {
                            group.classList.add("success");
                            if (errEl) errEl.textContent = "";
                        }
                        return true;
                    }
                }

                var nameValid = validateContactField(nameField, nameField && nameField.value.trim().length > 0, "Name is required");
                var emailValid = validateContactField(emailField, emailField && emailRe.test(emailField.value.trim()), "Please enter a valid email");
                var phoneValid = validateContactField(phoneField, phoneField && phoneField.value.trim().length >= 10, "Phone must have at least 10 digits");
                var messageValid = validateContactField(messageField, messageField && messageField.value.trim().length >= 10, "Message must be at least 10 characters");

                isValid = nameValid && emailValid && phoneValid && messageValid;

                if (!isValid) return;

                showToast("Message sent successfully! We'll get back to you soon.", "success");
                contactForm.reset();

                var formGroups = contactForm.querySelectorAll(".form-group");
                formGroups.forEach(function (g) {
                    g.classList.remove("success", "error");
                    var fe = g.querySelector(".error-message");
                    if (fe) fe.textContent = "";
                });
            });
        }

        /* ======================================================
           12. Settings Page
           ====================================================== */
        var settingsForm = document.getElementById("settingsForm");

        if (settingsForm) {
            var settingsName = document.getElementById("settingsName");
            var settingsEmail = document.getElementById("settingsEmail");
            var settingsPhone = document.getElementById("settingsPhone");

            if (settingsName) {
                settingsName.value = localStorage.getItem("userName") || "";
            }
            if (settingsEmail) {
                settingsEmail.value = localStorage.getItem("userEmail") || "";
            }
            if (settingsPhone) {
                settingsPhone.value = localStorage.getItem("userPhone") || "";
            }

            settingsForm.addEventListener("submit", function (e) {
                e.preventDefault();

                var name = settingsName ? settingsName.value.trim() : "";
                var email = settingsEmail ? settingsEmail.value.trim() : "";
                var phone = settingsPhone ? settingsPhone.value.trim() : "";

                if (name) localStorage.setItem("userName", name);
                if (email) localStorage.setItem("userEmail", email);
                if (phone) localStorage.setItem("userPhone", phone);

                showToast("Settings saved successfully!", "success");
            });

            var toggleSwitches = document.querySelectorAll(".toggle-switch input[type='checkbox']");
            toggleSwitches.forEach(function (toggle) {
                toggle.addEventListener("change", function () {
                    var parent = this.closest(".setting-item");
                    var label = parent ? parent.querySelector(".setting-label") : null;
                    var name = label ? label.textContent.trim() : "Setting";
                    var state = this.checked ? "enabled" : "disabled";
                    showToast(name + " " + state, "success");
                });
            });
        }

        /* ======================================================
           15. Project Status Filters
           ====================================================== */
        var projectFilterButtons = document.querySelectorAll(".filter-pill");
        var projectRows = document.querySelectorAll("#projectRow tr");

        if (projectFilterButtons.length && projectRows.length) {
            projectFilterButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var selectedStatus = button.textContent.trim();

                    projectFilterButtons.forEach(function (filterButton) {
                        filterButton.classList.remove("active", "selected");
                    });
                    button.classList.add("active", "selected");

                    document.querySelectorAll("#projectRow tr").forEach(function (row) {
                        var statusCell = row.querySelector("td:last-child");
                        var rowStatus = statusCell ? statusCell.textContent.trim() : "";
                        row.style.display = selectedStatus === "All" || rowStatus === selectedStatus ? "" : "none";
                    });
                });
            });
        }

        /* ======================================================
           16. Add Project (Projects Page Modal)
           ====================================================== */
        var addProjectBtn = document.getElementById("openAddProject");
        var projectModal = document.getElementById("addProjectModal");
        var projectForm = document.getElementById("addProjectForm");
        var projectTableBody = document.getElementById("projectRow");
        var cancelAddProjectBtn = document.getElementById("cancelAddProject");

        function openProjectModal() {
            if (projectModal) projectModal.classList.add("active");
        }

        function closeProjectModal() {
            if (projectModal) {
                projectModal.classList.remove("active");
                if (projectForm) projectForm.reset();
            }
        }

        if (addProjectBtn) {
            addProjectBtn.addEventListener("click", openProjectModal);
        }

        if (cancelAddProjectBtn) {
            cancelAddProjectBtn.addEventListener("click", closeProjectModal);
        }

        if (projectModal) {
            projectModal.addEventListener("click", function (e) {
                if (e.target === projectModal) closeProjectModal();
            });
        }

        if (projectForm && projectTableBody) {
            projectForm.addEventListener("submit", function (e) {
                e.preventDefault();

                var pName = document.getElementById("projectName");
                var pManager = document.getElementById("projectManager");
                var pDeadline = document.getElementById("projectDeadline");
                var pStatus = document.getElementById("projectStatus");

                var nameVal = pName ? pName.value.trim() : "";
                var managerVal = pManager ? pManager.value.trim() : "";
                var deadlineVal = pDeadline ? pDeadline.value : "";
                var statusVal = pStatus ? pStatus.value : "Pending";

                if (!nameVal) {
                    showToast("Please enter a project name.", "error");
                    return;
                }

                var statusClass = "status-pending";
                if (statusVal === "Completed") statusClass = "status-completed";
                else if (statusVal === "In Progress") statusClass = "status-progress";
                else if (statusVal === "On Hold") statusClass = "status-hold";

                var newRow = document.createElement("tr");
                newRow.innerHTML =
                    "<td><strong>" + escapeHtml(nameVal) + "</strong></td>" +
                    "<td>Stackly Client</td>" +
                    "<td>" + escapeHtml(managerVal) + "</td>" +
                    "<td><i class='uil uil-calendar-alt'></i> " + escapeHtml(deadlineVal) + "</td>" +
                    '<td><div class="progress-bar"><div class="progress-fill" data-width="0" style="background: linear-gradient(90deg, #6C63FF, #00D4AA);"></div></div><span class="progress-text">0%</span></td>' +
                    '<td><span class="status-badge ' + statusClass + '">' + escapeHtml(statusVal) + "</span></td>";

                projectTableBody.appendChild(newRow);

                closeProjectModal();
                showToast("Project added successfully!", "success");
            });
        }

        function escapeHtml(text) {
            var map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
            return text.replace(/[&<>"']/g, function (m) { return map[m]; });
        }

        /* ======================================================
           16. Progress Bar Animation
           ====================================================== */
        var progressFills = document.querySelectorAll(".progress-fill");

        if ("IntersectionObserver" in window && progressFills.length) {
            var progressObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var el = entry.target;
                        var targetWidth = el.getAttribute("data-width") || "0%";
                        setTimeout(function () {
                            el.style.width = targetWidth;
                        }, 200);
                        progressObserver.unobserve(el);
                    }
                });
            }, { threshold: 0.15 });

            progressFills.forEach(function (el) {
                el.style.width = "0%";
                progressObserver.observe(el);
            });
        } else {
            progressFills.forEach(function (el) {
                var targetWidth = el.getAttribute("data-width") || "0%";
                el.style.width = targetWidth;
            });
        }

        /* ======================================================
           14. Smooth Scroll for Anchor Links
           ====================================================== */
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener("click", function (e) {
                var targetId = this.getAttribute("href");
                if (targetId && targetId.length > 1) {
                    var targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        e.preventDefault();
                        var navHeight = navbar ? navbar.offsetHeight : 0;
                        var targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                        window.scrollTo({ top: targetPos, behavior: "smooth" });
                    }
                }
            });
        });

        /* ======================================================
           18. Dark Mode Toggle
           ====================================================== */
        var darkModeToggle = document.getElementById("darkModeToggle");

        function applyDarkMode() {
            var isDark = localStorage.getItem("darkMode") === "true";
            if (isDark) {
                document.body.classList.add("dark-mode");
            } else {
                document.body.classList.remove("dark-mode");
            }
            if (darkModeToggle) {
                darkModeToggle.checked = isDark;
            }
        }

        applyDarkMode();

        if (darkModeToggle) {
            darkModeToggle.addEventListener("change", function () {
                if (this.checked) {
                    document.body.classList.add("dark-mode");
                    localStorage.setItem("darkMode", "true");
                    showToast("Dark mode enabled", "success");
                } else {
                    document.body.classList.remove("dark-mode");
                    localStorage.setItem("darkMode", "false");
                    showToast("Dark mode disabled", "success");
                }
            });
        }

        /* ======================================================
           19. Notification Dropdown
           ====================================================== */
        var notifBell = document.getElementById("notificationBell") || document.querySelector(".notification-bell");
        var notifDropdown = document.querySelector(".notification-dropdown");
        var notifWrapper = document.getElementById("notificationWrapper") || (notifBell && notifBell.parentElement);

        if (notifBell && notifDropdown && notifWrapper) {
            function closeNotifications() {
                notifDropdown.classList.remove("active");
                notifDropdown.style.display = "none";
                notifBell.setAttribute("aria-expanded", "false");
            }

            function openNotifications() {
                notifDropdown.classList.add("active");
                notifDropdown.style.display = "block";
                notifBell.setAttribute("aria-expanded", "true");
            }

            closeNotifications();

            notifBell.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (notifDropdown.classList.contains("active")) {
                    closeNotifications();
                } else {
                    openNotifications();
                }
            });

            document.addEventListener("pointerdown", function (e) {
                if (!notifWrapper.contains(e.target)) {
                    closeNotifications();
                }
            }, true);

            notifDropdown.querySelectorAll(".notification-item").forEach(function (item) {
                item.addEventListener("click", function () {
                    closeNotifications();
                });
            });

            document.addEventListener("keydown", function (e) {
                if (e.key === "Escape") {
                    closeNotifications();
                }
            });

            var notifClose = notifDropdown.querySelector(".notif-close");
            if (notifClose) {
                notifClose.addEventListener("click", function () {
                    closeNotifications();
                });
            }
        }

        /* ======================================================
           Close any modal on Escape key
           ====================================================== */
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                var activeModals = document.querySelectorAll(".modal-overlay.active");
                activeModals.forEach(function (modal) {
                    modal.classList.remove("active");
                });
                if (notifDropdown) notifDropdown.classList.remove("active");
            }
        });

        /* ======================================================
           20. Custom Select Dropdowns
           ====================================================== */
        var customSelects = document.querySelectorAll("select");
        var openCustomSelect = null;

        function closeCustomSelect(customSelect) {
            if (!customSelect) return;
            var trigger = customSelect.querySelector(".custom-select-trigger");
            var menu = customSelect.querySelector(".custom-select-menu");
            if (trigger) trigger.setAttribute("aria-expanded", "false");
            if (menu) menu.remove();
            customSelect.classList.remove("is-open");
            if (openCustomSelect === customSelect) openCustomSelect = null;
        }

        customSelects.forEach(function (select) {
            var wrapper = document.createElement("div");
            wrapper.className = "custom-select";
            select.parentNode.insertBefore(wrapper, select);
            wrapper.appendChild(select);
            select.classList.add("custom-select-native");

            var trigger = document.createElement("button");
            trigger.type = "button";
            trigger.className = "custom-select-trigger";
            trigger.setAttribute("aria-haspopup", "listbox");
            trigger.setAttribute("aria-expanded", "false");
            wrapper.appendChild(trigger);

            function updateTrigger() {
                var selected = select.options[select.selectedIndex];
                trigger.innerHTML = "<span>" + (selected ? selected.textContent : "Select an option") + "</span><i class=\"uil uil-angle-down\"></i>";
            }

            function openCustomMenu() {
                if (openCustomSelect && openCustomSelect !== wrapper) closeCustomSelect(openCustomSelect);

                var menu = document.createElement("div");
                menu.className = "custom-select-menu";
                menu.setAttribute("role", "listbox");

                Array.prototype.forEach.call(select.options, function (option, index) {
                    var item = document.createElement("button");
                    item.type = "button";
                    item.className = "custom-select-option" + (index === select.selectedIndex ? " selected" : "");
                    item.setAttribute("role", "option");
                    item.setAttribute("aria-selected", index === select.selectedIndex ? "true" : "false");
                    item.textContent = option.textContent;
                    item.addEventListener("click", function () {
                        select.selectedIndex = index;
                        select.dispatchEvent(new Event("change", { bubbles: true }));
                        updateTrigger();
                        closeCustomSelect(wrapper);
                    });
                    menu.appendChild(item);
                });

                document.body.appendChild(menu);
                var rect = trigger.getBoundingClientRect();
                var gap = 6;
                var viewportPadding = 12;
                var maxMenuHeight = Math.min(260, window.innerHeight - viewportPadding * 2);
                var menuHeight = Math.min(menu.scrollHeight, maxMenuHeight);
                var spaceBelow = window.innerHeight - rect.bottom - gap - viewportPadding;
                var openAbove = spaceBelow < Math.min(190, menuHeight) && rect.top > menuHeight + gap + viewportPadding;
                var left = Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - rect.width - viewportPadding));

                menu.style.left = left + "px";
                menu.style.width = Math.min(rect.width, window.innerWidth - viewportPadding * 2) + "px";
                menu.style.maxHeight = maxMenuHeight + "px";
                menu.style.top = openAbove ? "auto" : (rect.bottom + gap) + "px";
                menu.style.bottom = openAbove ? (window.innerHeight - rect.top + gap) + "px" : "auto";

                wrapper.classList.add("is-open");
                trigger.setAttribute("aria-expanded", "true");
                openCustomSelect = wrapper;
            }

            trigger.addEventListener("click", function (event) {
                event.stopPropagation();
                if (wrapper.classList.contains("is-open")) closeCustomSelect(wrapper);
                else openCustomMenu();
            });

            select.addEventListener("change", updateTrigger);
            updateTrigger();
        });

        document.addEventListener("pointerdown", function (event) {
            if (openCustomSelect && !openCustomSelect.contains(event.target) && !event.target.closest(".custom-select-menu")) {
                closeCustomSelect(openCustomSelect);
            }
        }, true);

        window.addEventListener("resize", function () {
            if (openCustomSelect) closeCustomSelect(openCustomSelect);
        });

        /* Keep tablet/mobile pages anchored to the left edge. */
        function lockHorizontalPageScroll() {
            if (window.innerWidth <= 1200 && window.scrollX !== 0) {
                window.scrollTo(0, window.scrollY);
            }
        }

        if (window.innerWidth <= 1200) {
            lockHorizontalPageScroll();
            window.addEventListener("scroll", lockHorizontalPageScroll, { passive: true });

            var pageRoot = document.documentElement;
            var pageBody = document.body;
            var mainContent = document.querySelector(".main-content");
            var resetHorizontalScroll = function () {
                pageRoot.scrollLeft = 0;
                pageBody.scrollLeft = 0;
                if (mainContent) mainContent.scrollLeft = 0;
            };

            resetHorizontalScroll();
            window.addEventListener("touchstart", function (event) {
                if (event.touches.length) {
                    window.__horizontalTouchX = event.touches[0].clientX;
                    window.__horizontalTouchY = event.touches[0].clientY;
                }
            }, { passive: true });

            window.addEventListener("touchmove", function (event) {
                if (!event.touches.length) return;
                var dx = event.touches[0].clientX - (window.__horizontalTouchX || 0);
                var dy = event.touches[0].clientY - (window.__horizontalTouchY || 0);
                if (Math.abs(dx) > Math.abs(dy)) {
                    event.preventDefault();
                    resetHorizontalScroll();
                }
            }, { passive: false });

            window.addEventListener("wheel", function (event) {
                if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
                    event.preventDefault();
                    resetHorizontalScroll();
                }
            }, { passive: false });
        }

    }); // end DOMContentLoaded

    /* ==========================================================
       13. Toast System (outside DOMContentLoaded for global access)
       ========================================================== */
    function showToast(message, type) {
        type = type || "info";

        var existing = document.querySelectorAll(".toast");
        existing.forEach(function (t) {
            t.remove();
        });

        var toast = document.createElement("div");
        toast.className = "toast toast-" + type;

        var titles = {
            success: "Success",
            error: "Error",
            info: "Heads up",
            warning: "Warning"
        };

        var icons = {
            success: "uil-check-circle",
            error: "uil-exclamation-circle",
            info: "uil-info-circle",
            warning: "uil-exclamation-triangle"
        };

        var iconClass = icons[type] || icons.info;
        var title = titles[type] || titles.info;

        toast.innerHTML =
            '<div class="toast-icon"><i class="uil ' + iconClass + '"></i></div>' +
            '<div class="toast-content">' +
            '<div class="toast-title">' + title + "</div>" +
            '<div class="toast-message">' + message + "</div>" +
            "</div>" +
            '<button class="toast-close" aria-label="Close">&times;</button>' +
            '<span class="toast-progress"></span>';

        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.add("show");
        });

        var autoRemoveTimer = setTimeout(function () {
            removeToast(toast);
        }, 3000);

        var closeBtn = toast.querySelector(".toast-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", function () {
                clearTimeout(autoRemoveTimer);
                removeToast(toast);
            });
        }
    }

    function removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        toast.classList.remove("show");
        setTimeout(function () {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400);
    }

    window.showToast = showToast;

})();
