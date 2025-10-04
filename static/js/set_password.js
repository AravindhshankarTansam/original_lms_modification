document.addEventListener('DOMContentLoaded', function () {

    // --- Eye toggle for password fields ---
    const toggleSpans = document.querySelectorAll('.toggle-password');

    toggleSpans.forEach(function(span) {
        span.addEventListener('click', function() {
            const inputId = this.getAttribute('data-target');
            const input = document.getElementById(inputId);
            const icon = this.querySelector('i');

            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }
        });
    });

    // --- Live password constraint checking for password1 ---
    const passwordInput = document.getElementById('id_password1');
    const rules = {
        length: document.getElementById('rule-length'),
        uppercase: document.getElementById('rule-uppercase'),
        lowercase: document.getElementById('rule-lowercase'),
        number: document.getElementById('rule-number'),
        special: document.getElementById('rule-special')
    };

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const val = passwordInput.value;

            rules.length.style.color = val.length >= 8 ? 'green' : 'red';
            rules.uppercase.style.color = /[A-Z]/.test(val) ? 'green' : 'red';
            rules.lowercase.style.color = /[a-z]/.test(val) ? 'green' : 'red';
            rules.number.style.color = /[0-9]/.test(val) ? 'green' : 'red';
            rules.special.style.color = /[!@#$%^&*(),.?":{}|<>]/.test(val) ? 'green' : 'red';
        });
    }

    // --- Confirm password matching ---
    const confirmInput = document.getElementById('id_password2');
    const form = document.querySelector('form');

    // create or reuse a small status element below the confirm input
    let matchStatus = null;
    if (confirmInput) {
        matchStatus = document.createElement('div');
        matchStatus.setAttribute('aria-live', 'polite');
        matchStatus.style.fontSize = '0.9rem';
        matchStatus.style.marginTop = '0.35rem';
        matchStatus.style.display = 'none';
        confirmInput.parentElement.parentElement.appendChild(matchStatus);

        const updateMatchStatus = () => {
            const a = passwordInput ? passwordInput.value : '';
            const b = confirmInput.value;

            if (b.length === 0) {
                matchStatus.style.display = 'none';
                matchStatus.textContent = '';
                return;
            }

            if (a === b) {
                matchStatus.style.color = 'green';
                matchStatus.textContent = 'Passwords match.';
                matchStatus.style.display = 'block';
            } else {
                matchStatus.style.color = '#e53e3e';
                matchStatus.textContent = 'Passwords do not match.';
                matchStatus.style.display = 'block';
            }
        };

        // update on input for both fields
        confirmInput.addEventListener('input', updateMatchStatus);
        if (passwordInput) passwordInput.addEventListener('input', updateMatchStatus);
    }

    // Prevent form submission when passwords don't match
    if (form && confirmInput) {
        form.addEventListener('submit', (e) => {
            const a = passwordInput ? passwordInput.value : '';
            const b = confirmInput.value;
            if (a !== b) {
                e.preventDefault();
                if (matchStatus) {
                    matchStatus.style.color = '#e53e3e';
                    matchStatus.textContent = 'Passwords do not match.';
                    matchStatus.style.display = 'block';
                }
                // focus confirm input to help user
                confirmInput.focus();
            }
        });
    }

});
