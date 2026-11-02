
const API_URL = "http://127.0.0.1:5000/api/auth";

// ================= GET FORM ELEMENTS =================

const form = document.getElementById("register-form");

const fullNameInput = document.getElementById("full-name");
const enrollmentInput = document.getElementById("enrollment-id");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const termsInput = document.getElementById("terms");

const button = form.querySelector(".create-btn");

// ================= ERROR FUNCTIONS =================

function showError(input, message) {

    clearError(input);

    const error = document.createElement("small");

    error.className = "field-error";
    error.textContent = message;

    if (input === termsInput) {

        document.querySelector(".terms").appendChild(error);

    } else {

        input.closest(".input-group").appendChild(error);

        input.closest(".input-wrapper")
            .classList.add("input-invalid-wrapper");
    }
}

function clearError(input) {

    if (input === termsInput) {

        const error = document.querySelector(".terms .field-error");

        if (error) {
            error.remove();
        }

    } else {

        const group = input.closest(".input-group");

        const error = group.querySelector(".field-error");

        if (error) {
            error.remove();
        }

        input.closest(".input-wrapper")
            .classList.remove("input-invalid-wrapper");
    }
}

// ================= VALIDATION RULES =================

function validateField(input) {

    const value = input.value.trim();

    // Full Name
    if (input === fullNameInput) {

        if (!value) {
            showError(input, "Enter your name.");
            return false;
        }

        clearError(input);
        return true;
    }

    // Enrollment ID
    if (input === enrollmentInput) {

        if (!/^[0-9]{10}$/.test(value)) {

            showError(
                input,
                "Enrollment ID must contain exactly 10 digits."
            );

            return false;
        }

        clearError(input);
        return true;
    }

    // College Email
    if (input === emailInput) {

        if (!value) {

            showError(input, "Enter your college email.");
            return false;
        }

        const emailPattern =
            /^[a-zA-Z0-9._%+-]+@(gmail\.com|gla\.ac\.in)$/i;

        if (!emailPattern.test(value)) {

            showError(
                input,
                "Enter a valid Gmail or GLA email address."
            );

            return false;
        }

        clearError(input);
        return true;
    }

    // Password
    if (input === passwordInput) {

        if (!input.value) {

            showError(input, "Enter your password.");
            return false;
        }

        if (
            input.value.length !== 8 ||
            !/[A-Za-z]/.test(input.value) ||
            !/[0-9]/.test(input.value)
        ) {

            showError(
                input,
                "Password must be exactly 8 characters with at least one letter and one number."
            );

            return false;
        }

        clearError(input);

        // Also check confirm password if already entered.
        if (confirmPasswordInput.value) {
            validateField(confirmPasswordInput);
        }

        return true;
    }

    // Confirm Password
    if (input === confirmPasswordInput) {

        if (!input.value) {

            showError(input, "Confirm your password.");
            return false;
        }

        if (input.value !== passwordInput.value) {

            showError(input, "Passwords do not match.");
            return false;
        }

        clearError(input);
        return true;
    }

    return true;
}

// ================= INPUT RESTRICTIONS =================

// Only 10 digits allowed in Enrollment ID.
enrollmentInput.addEventListener("input", function () {

    this.value = this.value
        .replace(/[^0-9]/g, "")
        .slice(0, 10);

    validateField(this);
});

// Password maximum length.
passwordInput.maxLength = 8;
confirmPasswordInput.maxLength = 8;

// Show errors when user leaves a field.
const fields = [
    fullNameInput,
    enrollmentInput,
    emailInput,
    passwordInput,
    confirmPasswordInput
];

fields.forEach(input => {

    input.addEventListener("blur", function () {
        validateField(this);
    });

    input.addEventListener("input", function () {
        validateField(this);
    });

});

// Terms checkbox validation.
termsInput.addEventListener("change", function () {

    clearError(this);

});

// ================= FORM SUBMISSION =================

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    let isValid = true;
    let firstInvalidField = null;

    // Validate all input fields.
    fields.forEach(input => {

        const valid = validateField(input);

        if (!valid) {

            isValid = false;

            if (!firstInvalidField) {
                firstInvalidField = input;
            }
        }
    });

    // Validate Terms checkbox.
    if (!termsInput.checked) {

        showError(
            termsInput,
            "Please accept Terms & Conditions and Privacy Policy."
        );

        isValid = false;

        if (!firstInvalidField) {
            firstInvalidField = termsInput;
        }
    }

    // Stop registration if any error exists.
    if (!isValid) {

        firstInvalidField.focus();

        return;
    }

    // ================= SEND DATA TO BACKEND =================

    const registrationData = {

        fullName: fullNameInput.value.trim(),

        enrollmentId: enrollmentInput.value.trim(),

        email: emailInput.value.trim().toLowerCase(),

        password: passwordInput.value

    };

    const originalButtonText = button.innerHTML;

    try {

        button.disabled = true;
        button.textContent = "Creating Account...";

        const response = await fetch(
            `${API_URL}/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(registrationData)
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            if (response.status === 409) {

                showError(
                    enrollmentInput,
                    data.message
                );

                enrollmentInput.focus();

            } else if (response.status === 400) {

                showError(
                    emailInput,
                    data.message
                );

                emailInput.focus();

            } else {

                alert(data.message || "Registration failed.");

            }

            return;
        }

        alert("Account created successfully!");

        window.location.href =
            "../account-created/account-created.html";

    } catch (error) {

        console.error("Registration Error:", error);

        alert(
            "Unable to connect to server. Please check backend."
        );

    } finally {

        button.disabled = false;
        button.innerHTML = originalButtonText;

    }

});
