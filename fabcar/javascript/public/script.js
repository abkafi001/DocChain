const sign_in_btn_animation = document.getElementById('sign-in');
const sign_up_btn_animation = document.getElementById('sign-up');
const container = document.querySelector('.container');

const loginForm = document.forms["login"];
const singUpForm = document.forms["sign-up"];
// const username = form["username"];
// const password = form["password"];
const signUpBtn = document.getElementById("sign-up-btn");
const err = document.getElementById("error");
const passwordComp = document.getElementById("password-comp");

sign_up_btn_animation.addEventListener("click", () => {
  container.classList.add('sign-up-mode');
});

sign_in_btn_animation.addEventListener("click", () => {
  container.classList.remove('sign-up-mode');
});

loginForm.addEventListener('input', () => {
  if(err != null){
    err.remove();
  }
});

singUpForm.addEventListener('input', () => {
  if(singUpForm["password"].value != singUpForm["confirm_password"].value){
    passwordComp.firstElementChild.style.display = 'block';
    signUpBtn.disabled = true;
  }
  else{
    passwordComp.firstElementChild.style.display = 'none';
    signUpBtn.disabled = false;
  }
})