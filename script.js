/* ================= HELPER ================= */
const $ = id => document.getElementById(id);

/* ================= INIT STORAGE ================= */
["users", "doctors", "patients", "appointments"].forEach(k => {
  if (!localStorage.getItem(k)) {
    localStorage.setItem(k, JSON.stringify([]));
  }
});

/* ================= PAGE LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isLoggedIn") === "true") {

    document.body.classList.add("logged-in");

    $("auth-section").style.display = "none";
    $("app").style.display = "flex";

    showView("dashboard");

    refreshAll();
  }
});

/* ================= AUTH ================= */

function toggleAuth() {
  $("login-form").classList.toggle("hidden");
  $("register-form").classList.toggle("hidden");
}

/* REGISTER */

$("register-form")?.addEventListener("submit", e => {

  e.preventDefault();

  const users = JSON.parse(localStorage.getItem("users"));
  const username = $("reg-username").value.trim();

  if (users.some(u => u.username === username)) {
    $("register-msg").innerText = "❌ Username already exists";
    return;
  }

  users.push({
    username,
    password: $("reg-password").value,
    role: "receptionist"
  });

  localStorage.setItem("users", JSON.stringify(users));

  $("register-msg").innerText = "✅ Account created";

  e.target.reset();
});

/* LOGIN */

$("login-form")?.addEventListener("submit", e => {

  e.preventDefault();

  const users = JSON.parse(localStorage.getItem("users"));

  const user = users.find(u =>
    u.username === $("login-username").value.trim() &&
    u.password === $("login-password").value
  );

  if (!user) {
    $("login-error").innerText = "❌ Invalid login";
    return;
  }

  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("currentUser", user.username);

  document.body.classList.add("logged-in");

  $("auth-section").style.display = "none";
  $("app").style.display = "flex";

  showView("dashboard");

  refreshAll();
});

/* LOGOUT */

$("logout")?.addEventListener("click", () => {

  localStorage.removeItem("isLoggedIn");
  document.body.classList.remove("logged-in");

  location.reload();
});

/* ================= NAVIGATION ================= */

function showView(id) {

  document.querySelectorAll(".view").forEach(v => {
    v.classList.add("hidden");
  });

  $(id).classList.remove("hidden");

  if (id === "appointments") {
    $("a-payment").onchange = handlePaymentUI;
  }
}

document.querySelectorAll("[data-view]").forEach(btn => {
  btn.onclick = () => showView(btn.dataset.view);
});

/* ================= DASHBOARD ================= */

function loadDashboard() {

  $("total-patients").innerText =
    JSON.parse(localStorage.getItem("patients")).length;

  $("total-doctors").innerText =
    JSON.parse(localStorage.getItem("doctors")).length;

  $("total-appointments").innerText =
    JSON.parse(localStorage.getItem("appointments")).length;
}

/* ================= DOCTORS ================= */

$("doctor-form")?.addEventListener("submit", e => {

  e.preventDefault();

  const doctors = JSON.parse(localStorage.getItem("doctors"));

  doctors.push({
    name: $("d-name").value.trim(),
    specialty: $("d-specialty").value.trim(),
    availability: $("d-availability").value
  });

  localStorage.setItem("doctors", JSON.stringify(doctors));

  e.target.reset();

  refreshAll();
});

function loadDoctors() {

  const doctors = JSON.parse(localStorage.getItem("doctors"));

  $("doctor-list").innerHTML = "";

  $("p-doctor").innerHTML = "<option value=''>Select Doctor</option>";
  $("a-doctor").innerHTML = "<option value=''>Select Doctor</option>";

  doctors.forEach((d, i) => {

    $("doctor-list").innerHTML += `
      <tr>
        <td>${d.name}</td>
        <td>${d.specialty}</td>
        <td>${d.availability}</td>
        <td><button onclick="deleteDoctor(${i})">🗑</button></td>
      </tr>
    `;

    $("p-doctor").add(new Option(d.name, i));
    $("a-doctor").add(new Option(d.name, i));

  });
}

function deleteDoctor(i) {

  const doctors = JSON.parse(localStorage.getItem("doctors"));

  doctors.splice(i, 1);

  localStorage.setItem("doctors", JSON.stringify(doctors));

  refreshAll();
}

/* ================= PATIENTS ================= */

$("patient-form")?.addEventListener("submit", e => {

  e.preventDefault();

  const dIndex = $("p-doctor").value;

  if (!dIndex) return alert("Select doctor");

  const patients = JSON.parse(localStorage.getItem("patients"));
  const doctors = JSON.parse(localStorage.getItem("doctors"));

  patients.push({
    name: $("p-name").value.trim(),
    age: $("p-age").value,
    gender: $("p-gender").value,
    complaint: $("p-complaint").value.trim(),
    doctor: doctors[dIndex].name
  });

  localStorage.setItem("patients", JSON.stringify(patients));

  e.target.reset();

  refreshAll();
});

function loadPatients() {

  const patients = JSON.parse(localStorage.getItem("patients"));

  $("patient-list").innerHTML = "";
  $("a-patient").innerHTML = "<option value=''>Select Patient</option>";

  patients.forEach((p, i) => {

    $("patient-list").innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.age}</td>
        <td>${p.gender}</td>
        <td>${p.complaint}</td>
        <td>${p.doctor}</td>
        <td><button onclick="deletePatient(${i})">🗑</button></td>
      </tr>
    `;

    $("a-patient").add(new Option(p.name, i));
  });
}

function deletePatient(i) {

  const patients = JSON.parse(localStorage.getItem("patients"));

  patients.splice(i, 1);

  localStorage.setItem("patients", JSON.stringify(patients));

  refreshAll();
}

/* ================= PAYMENT UI ================= */

function handlePaymentUI() {

  $("card-box").classList.add("hidden");
  $("qr-box").classList.add("hidden");

  if ($("a-payment").value === "Card") {
    $("card-box").classList.remove("hidden");
  }
}

/* ================= APPOINTMENTS ================= */

let pendingAppointment = null;

$("appointment-form")?.addEventListener("submit", e => {

  e.preventDefault();

  const p = $("a-patient").value;
  const d = $("a-doctor").value;
  const date = $("a-date").value;
  const fees = $("a-fees").value;
  const payment = $("a-payment").value;

  if (!p || !d || !date || !fees || !payment)
    return alert("Fill all fields");

  const patients = JSON.parse(localStorage.getItem("patients"));
  const doctors = JSON.parse(localStorage.getItem("doctors"));

  pendingAppointment = {
    id: "APT-" + Date.now(),
    patient: patients[p].name,
    doctor: doctors[d].name,
    date,
    fees,
    payment
  };

  if (payment === "UPI") {

    $("qr-box").classList.remove("hidden");

    QRCode.toCanvas(
      $("qr-code"),
      `upi://pay?pa=clinic@upi&am=${fees}&cu=INR`,
      { width: 200 }
    );

  } else {

    finalizeAppointment();

  }
});

function confirmUPIPayment() {

  $("qr-box").classList.add("hidden");

  finalizeAppointment();
}

function finalizeAppointment() {

  const appointments = JSON.parse(localStorage.getItem("appointments"));

  appointments.push(pendingAppointment);

  localStorage.setItem("appointments", JSON.stringify(appointments));

  generateReceipt(pendingAppointment);

  alert("Appointment booked & payment successful ✅");

  pendingAppointment = null;

  $("appointment-form").reset();

  refreshAll();
}

/* ================= APPOINTMENT LIST ================= */

function loadAppointments() {

  const appointments = JSON.parse(localStorage.getItem("appointments"));

  $("appointment-list").innerHTML = "";

  appointments.forEach((a, i) => {

    $("appointment-list").innerHTML += `
      <tr>
        <td>${a.patient}</td>
        <td>${a.doctor}</td>
        <td>${new Date(a.date).toLocaleString()}</td>
        <td>₹${a.fees}</td>
        <td>${a.payment}</td>
        <td><button onclick="deleteAppointment(${i})">🗑</button></td>
      </tr>
    `;
  });
}

function deleteAppointment(i) {

  if (!confirm("Delete this appointment?")) return;

  const appointments = JSON.parse(localStorage.getItem("appointments"));

  appointments.splice(i, 1);

  localStorage.setItem("appointments", JSON.stringify(appointments));

  refreshAll();
}

/* ================= RECEIPT ================= */

function generateReceipt(data){

const { jsPDF } = window.jspdf;
const doc = new jsPDF();

let y = 20;

// Clinic Title
doc.setFontSize(20);
doc.text("SMART CLINIC", 105, y, {align:"center"});

y+=8;

doc.setFontSize(10);
doc.text("No 3, Jamal Street, Race course Road, Trichy-620020",105,y,{align:"center"});
y+=5;
doc.text("Phone: +91 9876543210",105,y,{align:"center"});

y+=10;

// Line
doc.line(10,y,200,y);

y+=10;

// Receipt Info
doc.setFontSize(12);

doc.text("Receipt ID:",10,y);
doc.text("RCPT-"+Date.now(),50,y);

doc.text("Date:",140,y);
doc.text(new Date().toLocaleDateString(),160,y);

y+=10;

doc.line(10,y,200,y);

y+=10;

// Patient Info
doc.text("Patient Name:",10,y);
doc.text(data.patient,60,y);

y+=10;

doc.text("Doctor:",10,y);
doc.text(data.doctor,60,y);

y+=10;

doc.text("Appointment Date:",10,y);
doc.text(data.date,60,y);

y+=10;

doc.line(10,y,200,y);

y+=10;

// Payment
doc.setFontSize(14);
doc.text("Payment Details",10,y);

y+=10;

doc.setFontSize(12);

doc.text("Consultation Fees:",10,y);
doc.text("Rs. "+data.fees,80,y);

y+=10;

doc.text("Payment Method:",10,y);
doc.text(data.payment,80,y);

y+=10;

doc.line(10,y,200,y);

y+=15;

// Footer
doc.setFontSize(10);
doc.text("Thank you for visiting our clinic!",105,y,{align:"center"});

y+=5;
doc.text("Get well soon !",105,y,{align:"center"});

// Save
doc.save("clinic_receipt.pdf");


}

/* ================= REFRESH ================= */

function refreshAll() {

  loadDashboard();
  loadDoctors();
  loadPatients();
  loadAppointments();
}
