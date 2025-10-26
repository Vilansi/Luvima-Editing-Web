 // Password toggle functionality for both password fields
        function setupPasswordToggle(toggleId, inputId) {
            const passwordToggle = document.getElementById(toggleId);
            const passwordInput = document.getElementById(inputId);
            const toggleIcon = passwordToggle.querySelector('i');

            passwordToggle.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                
                // Enhanced icon switching with smooth transition
                toggleIcon.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    toggleIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
                    toggleIcon.style.transform = 'scale(1)';
                }, 150);
                
                // Add visual feedback
                passwordToggle.style.color = isPassword ? 'var(--accent-cyan)' : 'var(--text-gray)';
            });
        }

        // Setup password toggles
        setupPasswordToggle('passwordToggle', 'password');
        setupPasswordToggle('confirmPasswordToggle', 'confirmPassword');

        // Password strength checker
        const passwordInput = document.getElementById('password');
        const strengthIndicator = document.getElementById('passwordStrength');
        const strengthBar = document.getElementById('strengthBar');
        const strengthText = document.getElementById('strengthText');

        function checkPasswordStrength(password) {
            let score = 0;
            let feedback = '';

            if (password.length >= 8) score++;
            if (/[a-z]/.test(password)) score++;
            if (/[A-Z]/.test(password)) score++;
            if (/[0-9]/.test(password)) score++;
            if (/[^A-Za-z0-9]/.test(password)) score++;

            // Remove previous strength classes
            strengthBar.className = 'strength-bar';
            
            if (password.length === 0) {
                strengthIndicator.classList.remove('show');
                return;
            }

            strengthIndicator.classList.add('show');

            switch(score) {
                case 0:
                case 1:
                case 2:
                    strengthBar.classList.add('strength-weak');
                    feedback = 'Weak password';
                    strengthText.style.color = 'var(--error-color)';
                    break;
                case 3:
                    strengthBar.classList.add('strength-fair');
                    feedback = 'Fair password';
                    strengthText.style.color = 'var(--accent-yellow)';
                    break;
                case 4:
                    strengthBar.classList.add('strength-good');
                    feedback = 'Good password';
                    strengthText.style.color = 'var(--accent-cyan)';
                    break;
                case 5:
                    strengthBar.classList.add('strength-strong');
                    feedback = 'Strong password';
                    strengthText.style.color = 'var(--success-color)';
                    break;
            }

            strengthText.textContent = feedback;
        }

        passwordInput.addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
        });

        // Form submission
        const signupForm = document.getElementById('signupForm');
        const signupBtn = document.getElementById('signupBtn');
        const messageDiv = document.getElementById('message');

        function showMessage(text, type = 'error') {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
            messageDiv.classList.add('show');
            
            setTimeout(() => {
                messageDiv.classList.remove('show');
            }, 5000);
        }

        function setLoading(loading) {
            if (loading) {
                signupBtn.classList.add('btn-loading');
                signupBtn.textContent = 'Creating Account...';
                signupBtn.disabled = true;
            } else {
                signupBtn.classList.remove('btn-loading');
                signupBtn.textContent = 'Create Account';
                signupBtn.disabled = false;
            }
        }

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;

            // Validation
            if (!firstName || !lastName) {
                showMessage('Please enter your full name', 'error');
                return;
            }

            if (!email || !email.includes('@')) {
                showMessage('Please enter a valid email address', 'error');
                return;
            }

            if (password.length < 8) {
                showMessage('Password must be at least 8 characters long', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }

            if (!agreeTerms) {
                showMessage('Please agree to the terms and conditions', 'error');
                return;
            }

            // Check password strength
            const strengthScore = checkPasswordStrengthScore(password);
            if (strengthScore < 3) {
                showMessage('Please choose a stronger password', 'error');
                return;
            }

            setLoading(true);

            // Simulate API call
            try {
                await new Promise(resolve => setTimeout(resolve, 2500));
                
                // Demo success
                showMessage('Account created successfully! Welcome aboard!', 'success');
                
                setTimeout(() => {
                    // In real app: window.location.href = '/dashboard';
                    console.log('Redirecting to dashboard...');
                }, 2000);
                
            } catch (error) {
                showMessage('Registration failed. Please try again.', 'error');
            } finally {
                setLoading(false);
            }
        });

        function checkPasswordStrengthScore(password) {
            let score = 0;
            if (password.length >= 8) score++;
            if (/[a-z]/.test(password)) score++;
            if (/[A-Z]/.test(password)) score++;
            if (/[0-9]/.test(password)) score++;
            if (/[^A-Za-z0-9]/.test(password)) score++;
            return score;
        }

        // Google sign-up (demo)
        const googleBtn = document.getElementById('googleBtn');
        googleBtn.addEventListener('click', () => {
            showMessage('Google Sign-Up would be implemented here', 'success');
        });

        // Input animations
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.style.transform = 'scale(1.02)';
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.style.transform = 'scale(1)';
            });
        });

        // Real-time password confirmation validation
        const confirmPasswordInput = document.getElementById('confirmPassword');
        confirmPasswordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (confirmPassword && password !== confirmPassword) {
                confirmPasswordInput.style.borderColor = 'var(--error-color)';
            } else if (confirmPassword && password === confirmPassword) {
                confirmPasswordInput.style.borderColor = 'var(--success-color)';
            } else {
                confirmPasswordInput.style.borderColor = 'var(--glass-border)';
            }
        });

        // Add interactive 3D card effect
        document.addEventListener('mousemove', (e) => {
            const card = document.querySelector('.signup-card');
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 30;
            const rotateY = (centerX - x) / 30;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        document.addEventListener('mouseleave', () => {
            const card = document.querySelector('.signup-card');
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });

        // Enhanced form validation with real-time feedback
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', () => {
            const email = emailInput.value.trim();
            if (email && !isValidEmail(email)) {
                emailInput.style.borderColor = 'var(--error-color)';
            } else if (email && isValidEmail(email)) {
                emailInput.style.borderColor = 'var(--success-color)';
            } else {
                emailInput.style.borderColor = 'var(--glass-border)';
            }
        });

        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // Terms and conditions link interactions
        const termsLinks = document.querySelectorAll('.terms-link');
        termsLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showMessage('Terms and Privacy Policy would open here', 'success');
            });
        });

        // Smooth scroll animations for form elements
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe form groups for animation
        document.querySelectorAll('.form-group, .terms-group').forEach(group => {
            group.style.opacity = '0';
            group.style.transform = 'translateY(20px)';
            group.style.transition = 'all 0.6s ease';
            observer.observe(group);
        });