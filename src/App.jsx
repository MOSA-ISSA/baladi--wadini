import React, { useEffect, useState } from "react";
import logo from "./img/logo.png";
import instagramImg from "./img/instagram-logo.png";

const apiUrl = "https://baladi-wadini.vercel.app";
const times = [
  { name: "فجر", time: { start: { h: 5, m: 0 }, end: { h: 6, m: 0 } } },
  { name: "ظهر", time: { start: { h: 11, m: 30 }, end: { h: 12, m: 30 } } },
  { name: "عصر", time: { start: { h: 14, m: 30 }, end: { h: 15, m: 30 } } },
  { name: "مغرب", time: { start: { h: 17, m: 0 }, end: { h: 18, m: 0 } } },
  { name: "عشاء", time: { start: { h: 18, m: 20 }, end: { h: 19, m: 0 } } },
  // { name: "test", time: { start: { h: 0, m: 15 }, end: { h: 1, m: 20 } } },
  // { name: "test1", time: { start: { h: 1, m: 22 }, end: { h: 2, m: 20 } } },
]

const App = () => {
  const [user, setUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [points, setPoints] = useState(0);
  const [salaTime, setSalaTime] = useState(localStorage.getItem("salaTime") || null);
  const [admin, setAdmin] = useState(false);
  const [canGetUser, setGetUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toChangeNumber, setChange] = useState({
    state: false,
    number: "",
  });
  const [changingNumber, setChangingNumber] = useState('');
  const [lastVisitTime, setLastVisitTime] = useState(
    localStorage.getItem("lastVisitTime") || null
  );

  function showNotification(message, duration = 3000, color = "#333") {
    const notification = document.getElementById("notification");
    if (notification) {
      notification.textContent = message;
      notification.style.display = "block";
      notification.style.backgroundColor = color;
      setTimeout(() => (notification.style.display = "none"), duration);
    }
  }

  const canGetPoint = () => {
    const now = new Date();
    const lastVisitTimeDate = new Date(lastVisitTime).getDate();

    const start = (time) => {
      if (now.getHours() === time.time.start.h) {
        return now.getMinutes() >= time.time.start.m
      } else {
        return now.getHours() > time.time.start.h
      }
    }

    const end = (time) => {
      if (now.getHours() === time.time.end.h) {
        return now.getMinutes() <= time.time.end.m
      } else {
        return now.getHours() < time.time.end.h
      }
    }

    const validTime = times.some((time) => start(time) && end(time))
    const checked = lastVisitTimeDate === now.getDate() && salaTime === getTime();
    console.log("⏳validTime: ", validTime ? "✅" : "❌");
    console.log("🕛checked: ", checked ? "✅" : "❌");
    return validTime && !checked;
  };
  const isWithinAllowedTime = () => {
    const now = new Date();
    const start = (time) => {
      if (now.getHours() === time.time.start.h) {
        return now.getMinutes() >= time.time.start.m
      } else {
        return now.getHours() > time.time.start.h
      }
    }
    const end = (time) => {
      if (now.getHours() === time.time.end.h) {
        return now.getMinutes() <= time.time.end.m
      } else {
        return now.getHours() < time.time.end.h
      }
    }
    const validTime = times.some((time) => start(time) && end(time))
    return validTime
  };

  const getTime = () => {
    const now = new Date();
    const start = (time) => {
      if (now.getHours() === time.time.start.h) {
        return now.getMinutes() >= time.time.start.m
      } else {
        return now.getHours() > time.time.start.h
      }
    }

    const end = (time) => {
      if (now.getHours() === time.time.end.h) {
        return now.getMinutes() <= time.time.end.m
      } else {
        return now.getHours() < time.time.end.h
      }
    }

    const foundTime = times.find((time) => {
      if (start(time) && end(time)) {
        console.log("time.name", time.name);
        return time.name;
      }
    })
    return foundTime?.name || "لا يوجد صلاة في هذه الوقت";
  };

  const updatePointsBasedOnTime = () => {
    const localStoragePhoneNumber = localStorage.getItem("phoneNumber");
    if (isWithinAllowedTime()) {
      setLoading(true);
      fetch(`${apiUrl}/addPoint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneNumber || localStoragePhoneNumber }),
      })
        .then((response) => response.json())
        .then((res) => {
          console.log("⚙️⚙️⚙️", res);

          if (res.success) {
            setPoints(res.points);
            localStorage.setItem("points", res.points);
            const now = new Date();
            setLastVisitTime(now);
            localStorage.setItem("lastVisitTime", now);
            showNotification("لقد حصلت على نقطة جديدة!", 3000, "green");
          } else {
            showNotification(res.message, 3000, "red");
          }
        })
        .catch(() =>
          showNotification("خطأ في الاتصال بالخادم!", 3000, "red")
        )
        .finally(() => setLoading(false));
    }
  };

  function registerPhoneNumber(localNumber) {

    if (false) {//!isWithinAllowedTime()
      showNotification("التسجيل مسموح فقط خلال اوقات الصلاة.", 1000 * 60, "red");
      return;
    }
    if (!localNumber) {
      if ((!phoneNumber || !/^\d{10}$/.test(phoneNumber))) {
        showNotification("يرجى إدخال رقم هاتف صالح!", 3000, "red");
        return;
      }
    }
    setLoading(true);
    fetch(apiUrl + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber: phoneNumber || localNumber }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          console.log("res: ", res);
          const points = res.points || 0;
          localStorage.setItem("phoneNumber", phoneNumber || localNumber);
          localStorage.setItem("points", points);
          setPoints(points);
          setUser(res.data);
          localStorage.setItem("lastVisitTime", new Date());
          localStorage.setItem("salaTime", getTime());
          if (canGetPoint()) {
            updatePointsBasedOnTime();
          }
          showNotification("تم التسجيل بنجاح!", 3000, "green");
        } else {
          showNotification(res.message, 3000, "red"); // Show error message
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showNotification("خطأ في الاتصال بالخادم!", 3000 * 60, "red");
      })
      .finally(() => setLoading(false));
  }

  function verifyPassword() {
    console.log("password: ", password);

    const correctPassword = "admin123";
    if (password === correctPassword) {
      setAdmin(true);
      setGetUser(true);
      showNotification("تم تسجيل الدخول بنجاح!", 3000, "green");
    } else {
      showNotification("كلمة المرور غير صحيحة!", 3000, "red");
    }
  }

  const changeUserNumber = (number) => {
    if (number.length < 10) {
      setChangingNumber(number);
    }
  };

  const save =()=>{}

  useEffect(() => {
    const storedPhoneNumber = localStorage.getItem("phoneNumber");
    console.log("storedPhoneNumber: ", storedPhoneNumber || "no number");

    if (storedPhoneNumber) {
      registerPhoneNumber(storedPhoneNumber);
    }
    console.log("isWithinAllowedTime", !!isWithinAllowedTime());
    console.log("canGetPoint", !!canGetPoint());
    console.log("getTime", getTime());
  }, []);

  useEffect(() => {
    if (canGetUser) {
      setLoading(true);
      fetch(`${apiUrl}/getAllUsers`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.success) {
            setUsers(res.data);
          } else {
            showNotification(res.message, 3000, "red");
          }
        })
        .catch(() => showNotification("خطاء في الاتصال بالخادم", 3000, "red"))
        .finally(() => setLoading(false));
    }
  }, [canGetUser]);

  return (
    <div>
      <div className="header">
        <img src={logo} alt="شعار المبادرة" />
        <h1>مبادرة بلدي وديني</h1>
      </div>

      <div className="time">
        الوقت :  {getTime()}
      </div>

      {
        // --------------------------
        !admin ?
          <div className="container">

            {
              user ?
                <div>
                  <div className="message" id="thank-you-message">
                    شكرًا لتسجيلك! لقد حصلت على:
                  </div>
                  <div className="points" id="pointsDisplay">
                    {points} نقطة
                  </div>
                  <div className="user-phone-number" id="user-phone-number">
                    رقم هاتفك: {user.phoneNumber}
                  </div>
                  <div className="instagram-link" id="instagram-link">
                    <a href="https://www.instagram.com/good.traces?igsh=MWVqczd3NGQyYmx3ZA==" target="_blank">
                      <img src={instagramImg} alt="Instagram" />تابعنا على
                      إنستجرام
                    </a>
                  </div>
                </div>
                :
                <div className="input-container" id="registration-form">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="أدخل رقم هاتفك"
                    pattern="[0-9]{10}"
                    title="يجب أن يحتوي رقم الهاتف على 10 أرقام"
                    required
                  />
                  <button onClick={registerPhoneNumber}>تسجيل</button>
                </div>
            }

            <div className="notification" id="notification" />

          </div>
          :
          <div className="container">
            {
              !canGetUser ?
                <div className="input-container" id="registration-form">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ادخل كلمة المرور"
                    required
                  />
                  <button onClick={verifyPassword}>تسجيل الدخول</button>
                </div>
                // --------------------------
                :
                <div id="admin-content">
                  <table>
                    <thead>
                      <tr>
                        <th>رقم الهاتف</th>
                        <th>عدد التسجيلات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.phoneNumber}>
                          {
                            toChangeNumber.state && toChangeNumber.phoneNumber === user.phoneNumber ?
                              <>
                                <input
                                  type="tel"
                                  value={changingNumber}
                                  onChange={(e) => { changeUserNumber(e.target.value) }}
                                />
                                <button>save</button>
                              </>
                              :
                              <td
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setChange({ state: true, phoneNumber: user.phoneNumber })
                                  setChangingNumber(user.phoneNumber)
                                  localStorage.setItem("changePhoneNumber", user.phoneNumber);
                                }}>
                                {user.phoneNumber}
                              </td>
                          }
                          <td>{user.points.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }
            <div className="notification" id="notification" />
          </div>
      }
      <a
        onClick={() => setAdmin(!admin)}
        style={{ display: "block", marginTop: "20px", textAlign: 'center' }}
      >
        {admin ? "الصفحة الرئيسية" : "لوحة الإدار"}
      </a>

      <div
        className="loading"
        style={{ display: "block", marginTop: "20px", textAlign: 'center' }}
      >
        {loading ? "...جاري التحميل" : ""}
      </div>

      {/* <button onClick={updatePointsBasedOnTime}>TEST </button> */}
    </div>
  );
};

export default App;
