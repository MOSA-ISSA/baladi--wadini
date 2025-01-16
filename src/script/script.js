// Function to show a notification message
function showNotification(message, duration = 3000, color = "#333") {
  const notification = document.getElementById("notification");
  if (notification) {
    notification.textContent = message;
    notification.style.display = "block";
    notification.style.backgroundColor = color;
    setTimeout(() => (notification.style.display = "none"), duration);
  }
}

// Function to check if the user is visiting within the allowed time
function isWithinAllowedTime() {
  const now = new Date();
  const nowInMinutes = now.getHours() * 60 + now.getMinutes(); // current time in minutes
  const lastVisitTime = parseInt(localStorage.getItem("lastVisitTime")) || null;
  const newDateLastVisitTime = new Date(lastVisitTime);
  // Calculate the time since the last visit
  if (newDateLastVisitTime.getHours() - now.getHours() < 1) {
    showNotification("لقد حصلت على نقطة في نفس الوقت", 3000 * 60, "red");
    return false;
  }

  // Define allowed time ranges (in minutes)
  const allowedTimes = [
    [290, 500],  // 4:50 AM - 6:00 AM
    [690, 780],  // 11:30 AM - 1:00 PM
    [855, 915],  // 2:15 PM - 3:15 PM
    [1005, 1065], // 5:00 PM - 6:05 PM
    [1065, 1150], // 6:05 PM - 7:40 PM
  ];

  console.log(allowedTimes.some(
    ([start, end]) => nowInMinutes >= start && nowInMinutes <= end
  ), "test time");

  // Check if the given time is within any of the allowed ranges
  return allowedTimes.some(([start, end]) => nowInMinutes >= start && nowInMinutes <= end);
}

// Function to update points based on the visit time condition
function updatePointsBasedOnTime() {
  const lastVisitTime = localStorage.getItem("lastVisitTime");
  const points = parseInt(localStorage.getItem("points")) || 0;

  if (isWithinAllowedTime()) {
    console.log("new point:", points + 1);
    fetch("/api/addPoint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber: localStorage.getItem("phoneNumber") }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          const newPoints = res.points;
          localStorage.setItem("points", newPoints);
          const pointDisplay = document.getElementById("pointsDisplay");
          if (pointDisplay) pointDisplay.textContent = `${newPoints} نقطة`;
          localStorage.setItem("lastVisitTime", new Date()); // Update last visit time
          showNotification("لقد حصلت على نقطة جديدة!", 3000, "green");
        } else {
          showNotification(res.message, 3000, "red"); // Show error message
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showNotification("خطأ في الاتصال بالخادم!", 3000 * 60, "red");
      });
  }

  // Update the points display on the page
  const pointsDisplay = document.getElementById("pointsDisplay");
  if (pointsDisplay) pointsDisplay.textContent = `${localStorage.getItem("points")} نقطة`;
}

// Function to register phone number and check user data
function registerPhoneNumber(localNumber) {
  const phoneNumber = document.getElementById("phone-number").value;
  const pointsDisplay = document.getElementById("pointsDisplay");
  const notification = document.getElementById("notification");
  const thankYouMessage = document.getElementById("thank-you-message");

  if (!isWithinAllowedTime()) {
    showNotification("التسجيل مسموح فقط خلال اوقات الصلاة.", 1000 * 60, "red");
    return;
  }

  // Check if phone number is valid and not empty
  if (!localNumber && (!phoneNumber || !/^\d{10}$/.test(phoneNumber))) {
    showNotification("يرجى إدخال رقم هاتف صالح!", 3000, "red");
    return;
  }

  fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber: phoneNumber || localNumber }),
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.success) {
        const points = res.points || 0;
        localStorage.setItem("phoneNumber", phoneNumber || localNumber);
        localStorage.setItem("lastVisitTime", new Date()); // Save visit time
        window.location.reload();
        // Show thank you message and update points
        thankYouMessage.style.display = "block";
        pointsDisplay.textContent = `${points} نقطة`;
        localStorage.setItem("points", points);
        showNotification("تم التسجيل بنجاح!", 3000, "green");
      } else {
        showNotification(res.message, 3000, "red"); // Show error message
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showNotification("خطأ في الاتصال بالخادم!", 3000 * 60, "red");
    });
}

// Function to show thank you message after registration
function showThankYouMessage(phoneNumber) {
  const thankYouMessage = document.getElementById("thank-you-message");
  const pointsDisplay = document.getElementById("pointsDisplay");
  const userPhoneNumber = document.getElementById("user-phone-number");

  thankYouMessage.style.display = "block";
  pointsDisplay.textContent = `${localStorage.getItem("points")} نقطة`;
  pointsDisplay.style.display = "block";
  userPhoneNumber.style.display = "block";
  // console.log("phoneNumber: ", userPhoneNumber.value);


  const userPhone = document.getElementById("user-phone");
  if (userPhone) userPhone.textContent = phoneNumber;

  const instagramLink = document.getElementById("instagram-link");
  if (instagramLink) instagramLink.style.display = "block";

  const registrationForm = document.getElementById("registration-form");
  if (registrationForm) registrationForm.style.display = "none";

  if (isWithinAllowedTime()) {
    updatePointsBasedOnTime();
    showNotification("لقد حصلت على نقطة جديدة!", 3000, "green");
  }
}

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // localStorage.clear();
  const lastVisitTime = localStorage.getItem("lastVisitTime");
  console.log("lastVisitTime", new Date().getHours());
  console.log("isWithinAllowedTime: ", isWithinAllowedTime());

  const phoneNumber = localStorage.getItem("phoneNumber");

  if (phoneNumber) {
    console.log("on page start phoneNumber: ", phoneNumber);
    // registerPhoneNumber(phoneNumber);
    showThankYouMessage(phoneNumber);
    const registrationForm = document.getElementById("registration-form");
    if (registrationForm) registrationForm.style.display = "none";
  } else {
    if (!isWithinAllowedTime()) {
      showNotification("التسجيل مسموح فقط خلال اوقات الصلاة.", 1000 * 60, "red");
    }
  }
});

async function test() {
  console.log("test");
  try {
    const response = await fetch('/api/getAllUsers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success) {
      const users = result.data;
      console.log('User data:', users);
    } else {
      console.error(result.message);
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }

}
