// Function to verify the admin password and fetch user data
function verifyPassword() {
  const password = document.getElementById('admin-password').value;

  // Here you can change the password verification logic if needed
  const correctPassword = "admin123"; // Example password, should be changed for production

  if (password === correctPassword) {
    document.getElementById('notification').style.display = 'none'; // Hide notification
    document.getElementById('admin-content').style.display = 'block'; // Show admin content
    fetchData();
  } else {
    document.getElementById('notification').style.display = 'block';
    document.getElementById('notification').innerText = 'كلمة المرور غير صحيحة!';
  }
}

// Function to fetch user data from the server
async function fetchData() {
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

      displayUserData(users);
    } else {
      document.getElementById('notification').style.display = 'block';
      document.getElementById('notification').innerText = 'فشل في جلب البيانات';
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    document.getElementById('notification').style.display = 'block';
    document.getElementById('notification').innerText = 'حدث خطأ في الاتصال بالخادم';
  }
}

// Function to display user data in the table
function displayUserData(users) {
  const adminDataTable = document.getElementById('admin-data');
  adminDataTable.innerHTML = ''; // Clear existing table rows

  users.forEach(user => {
    const row = document.createElement('tr');

    const phoneCell = document.createElement('td');
    phoneCell.textContent = user.phoneNumber; // Assuming user has a phoneNumber field
    row.appendChild(phoneCell);

    const registrationCountCell = document.createElement('td');
    registrationCountCell.textContent = user.points.length || 0; // Replace with real count field
    row.appendChild(registrationCountCell);

    // const actionCell = document.createElement('td');
    // Add action buttons or other controls here
    // actionCell.innerHTML = '<button onclick="performAction()">إجراء</button>';
    // row.appendChild(actionCell);

    adminDataTable.appendChild(row);
  });
}
