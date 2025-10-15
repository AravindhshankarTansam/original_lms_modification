document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".learning-path-card .btn-black");
    btn?.addEventListener("click", () => {
        alert("Self-Assessment clicked!");
    });
});
    
// Password Toggle
const toggleNewPwd = document.getElementById('toggleNewPwd');
const toggleConfirmPwd = document.getElementById('toggleConfirmPwd');

toggleNewPwd.onclick = function () {
  const pwd = document.getElementById('newPassword');
  const icon = this.querySelector('i');
  pwd.type = pwd.type === 'password' ? 'text' : 'password';
  icon.classList.toggle('bi-eye');
  icon.classList.toggle('bi-eye-slash');
};

toggleConfirmPwd.onclick = function () {
  const pwd = document.getElementById('confirmNewPassword');
  const icon = this.querySelector('i');
  pwd.type = pwd.type === 'password' ? 'text' : 'password';
  icon.classList.toggle('bi-eye');
  icon.classList.toggle('bi-eye-slash');
};

// Form Validation
document.getElementById('changePasswordForm').onsubmit = function (e) {
  e.preventDefault();
  const pwd = document.getElementById('newPassword');
  const cpwd = document.getElementById('confirmNewPassword');
  pwd.classList.remove('is-invalid');
  cpwd.classList.remove('is-invalid');

  const valid = pwd.value.length >= 8 && /[A-Z]/.test(pwd.value) && /[!@#$%^&*?]/.test(pwd.value);
  if (!valid || pwd.value !== cpwd.value) {
    if (!valid) pwd.classList.add('is-invalid');
    if (pwd.value !== cpwd.value) cpwd.classList.add('is-invalid');
    return;
  }
  alert('Password changed successfully!');
};

document.getElementById('editProfileForm').onsubmit = function (e) {
  e.preventDefault();
  alert('Profile updated successfully!');
  bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
};
