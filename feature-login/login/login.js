const API_URL = "http://127.0.0.1:5000/api/auth";

const studentForm = document.querySelector(".student-form form");
const adminForm = document.querySelector(".admin-form form");

/* =========================
   CREATE ERROR MESSAGE
========================= */

function createErrorMessage(input) {
    const error = document.createElement("div");

    error.className = "validation-error";

    input.closest(".input-group").appendChild(error);

    return error;
}


/* =========================
   SHOW / HIDE ERROR
========================= */

function showError(input, message) {

    let error = input
        .closest(".input-group")
        .querySelector(".validation-error");

    if (!error) {
        error = createErrorMessage(input);
    }

    error.textContent = message;

    input.classList.add("input-error");
}


function hideError(input) {

    const group = input.closest(".input-group");

    const error = group.querySelector(".validation-error");

    if (error) {
        error.remove();
    }

    input.classList.remove("input-error");
}


/* =========================
   ENROLLMENT VALIDATION
========================= */

function validateEnrollment(input) {

    const value = input.value.trim();

    if (value === "") {
        showError(input, "Please enter your Enrollment ID.");
        return false;
    }

    if (!/^[0-9]{10}$/.test(value)) {
        showError(
            input,
            "Enrollment ID must contain exactly 10 digits."
        );
        return false;
    }

    hideError(input);

    return true;
}


/* =========================
   PASSWORD VALIDATION
========================= */

function validatePassword(input) {

    const password = input.value;

    if (password === "") {
        showError(input, "Please enter your password.");
        return false;
    }

    if (password.length !== 8) {
        showError(
            input,
            "Password must be exactly 8 characters."
        );
        return false;
    }

    if (!/[A-Za-z]/.test(password)) {
        showError(
            input,
            "Password must contain at least one letter."
        );
        return false;
    }

    if (!/[0-9]/.test(password)) {
        showError(
            input,
            "Password must contain at least one number."
        );
        return false;
    }

    hideError(input);

    return true;
}


/* =========================
   REMEMBER ME VALIDATION
========================= */

function validateRemember(form) {

    const checkbox = form.querySelector(
        'input[type="checkbox"]'
    );

    let error = form.querySelector(".remember-error");

    if (!checkbox.checked) {

        if (!error) {

            error = document.createElement("div");

            error.className =
                "validation-error remember-error";

            checkbox.closest(".remember-me")
                ?.appendChild(error)
                ||
                checkbox.parentElement.appendChild(error);
        }

        error.textContent =
            "Please select Remember Me to continue.";

        return false;
    }

    if (error) {
        error.remove();
    }

    return true;
}


/* =========================
   LIVE STUDENT VALIDATION
========================= */

const enrollmentInput =
    document.getElementById("enrollment");

const studentPasswordInput =
    document.getElementById("student-password");

enrollmentInput.maxLength = 10;

enrollmentInput.addEventListener("input", function () {

    this.value = this.value
        .replace(/[^0-9]/g, "")
        .slice(0, 10);

    validateEnrollment(this);
});

enrollmentInput.addEventListener("blur", function () {
    validateEnrollment(this);
});


studentPasswordInput.maxLength = 8;

studentPasswordInput.addEventListener("input", function () {
    validatePassword(this);
});

studentPasswordInput.addEventListener("blur", function () {
    validatePassword(this);
});


/* =========================
   LOGIN API
========================= */

async function loginUser(
    form,
    endpoint,
    credentials,
    dashboard
) {

    const button =
        form.querySelector(".login-button");

    const originalText = button.innerHTML;

    try {

        button.disabled = true;

        button.textContent = "Signing In...";

        const response = await fetch(
            `${API_URL}/${endpoint}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(credentials)
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Invalid credentials."
            );

            return;
        }

        sessionStorage.setItem(
            "loggedInUser",
            JSON.stringify(data.user)
        );

        window.location.href = dashboard;

    } catch (error) {

        console.error("Login Error:", error);

        alert(
            "Unable to connect to the server."
        );

    } finally {

        button.disabled = false;

        button.innerHTML = originalText;
    }
}


/* =========================
   STUDENT LOGIN
========================= */

studentForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const enrollmentValid =
            validateEnrollment(enrollmentInput);

        const passwordValid =
            validatePassword(studentPasswordInput);

        const rememberValid =
            validateRemember(studentForm);

        if (
            !enrollmentValid ||
            !passwordValid ||
            !rememberValid
        ) {
            return;
        }

        loginUser(
            studentForm,

            "student-login",

            {
                enrollmentId:
                    enrollmentInput.value.trim(),

                password:
                    studentPasswordInput.value
            },

            "../../feature-student/student-dashboard/student-dashboard.html"
        );
    }
);


/* =========================
   ADMIN LOGIN
========================= */

const adminIdInput =
    document.getElementById("admin-id");

const adminPasswordInput =
    document.getElementById("admin-password");

adminForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        let valid = true;

        if (adminIdInput.value.trim() === "") {

            showError(
                adminIdInput,
                "Please enter your Admin ID."
            );

            valid = false;

        } else {

            hideError(adminIdInput);
        }


        if (adminPasswordInput.value === "") {

            showError(
                adminPasswordInput,
                "Please enter your password."
            );

            valid = false;

        } else {

            hideError(adminPasswordInput);
        }


        const rememberValid =
            validateRemember(adminForm);


        if (!valid || !rememberValid) {
            return;
        }


        loginUser(
            adminForm,

            "admin-login",

            {
                adminId:
                    adminIdInput.value.trim(),

                password:
                    adminPasswordInput.value
            },

            "../../feature-admin/admin/admin-dashboard.html"
        );
    }
);