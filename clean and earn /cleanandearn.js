
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(id).style.display = "block";

    if (id === "admin") loadAdmin();
    if (id === "reward") generateCaptcha();
}


function signup(e) {
    e.preventDefault();

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let email = document.getElementById("email").value;

    if (users.find(u => u.email === email)) {
        alert("User already exists!");
        return;
    }

    users.push({
        name: document.getElementById("name").value,
        email: email,
        password: document.getElementById("password").value,
        points: 0
    });

    localStorage.setItem("users", JSON.stringify(users));
    alert("Signup successful!");
    showPage("login");
}


function login(e) {
    e.preventDefault();

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let email = document.getElementById("loginEmail").value;
    let pass = document.getElementById("loginPassword").value;

    let user = users.find(u => u.email === email && u.password === pass);

    if (user) {
        localStorage.setItem("loggedInUser", email);

        document.getElementById("username").innerText = user.name;
        document.getElementById("useremail").innerText = user.email;

        alert("Login success!");
        showPage("home");
    } else {
        document.getElementById("loginMsg").innerText = "Invalid credentials!";
    }
}

function logout() {
    localStorage.removeItem("loggedInUser");
    alert("Logged out!");
    showPage("login");
}


function uploadData(e) {
    e.preventDefault();

    let userEmail = localStorage.getItem("loggedInUser");
    if (!userEmail) {
        alert("Login first!");
        return;
    }

    let photo = document.getElementById("photo").files[0];
    let qr = document.getElementById("qr").files[0];
    let upi = document.getElementById("upi").value;

    let reader1 = new FileReader();
    let reader2 = new FileReader();

    reader1.onload = function () {
        reader2.onload = function () {

            let data = JSON.parse(localStorage.getItem("data")) || [];

            data.push({
                user: userEmail,
                photo: reader1.result,
                qr: reader2.result,
                upi: upi,
                status: "pending"
            });

            localStorage.setItem("data", JSON.stringify(data));

            alert("Upload submitted for approval!");
        };

        if (qr) reader2.readAsDataURL(qr);
        else reader2.onload();
    };

    reader1.readAsDataURL(photo);
}


function loadAdmin() {
    let container = document.getElementById("adminList");
    container.innerHTML = "";

    let data = JSON.parse(localStorage.getItem("data")) || [];

    data.forEach((item, i) => {
        container.innerHTML += `
            <div class="admin-card">
                <p><b>${item.user}</b></p>
                <img src="${item.photo}" width="100"><br>
                ${item.qr ? `<img src="${item.qr}" width="100">` : ""}
                <p>UPI: ${item.upi}</p>
                <p>Status: ${item.status}</p>

                <button class="approve" onclick="approve(${i})">Approve</button>
                <button class="reject" onclick="reject(${i})">Reject</button>
            </div>
        `;
    });
}

function approve(i) {
    let data = JSON.parse(localStorage.getItem("data"));
    addPoints(data[i].user);
    data.splice (i ,1);
    
    localStorage.setItem("data", JSON.stringify(data));

    
    alert("Approved + Points Added!");
    loadAdmin();
}


function reject(i) {
    let data = JSON.parse(localStorage.getItem("data"));
    data.splice (i ,1);
    
    localStorage.setItem("data", JSON.stringify(data));

    alert("Rejected!");
    loadAdmin();
}



function addPoints(email) {
    let users = JSON.parse(localStorage.getItem("users"));

    let user = users.find(u => u.email === email);
    if (user) {
        user.points += 10;
    }

    localStorage.setItem("users", JSON.stringify(users));
}

let captcha = "";

function generateCaptcha() {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    captcha = "";

    for (let i = 0; i < 6; i++) {
        captcha += chars[Math.floor(Math.random() * chars.length)];
    }

    document.getElementById("captchaText").innerText = captcha;
}

function collectReward() {
    let input = document.getElementById("captchaInput").value;

    if (input !== captcha) {
        alert("Wrong CAPTCHA!");
        generateCaptcha();
        return;
    }

    let email = localStorage.getItem("loggedInUser");
    let users = JSON.parse(localStorage.getItem("users"));

    let user = users.find(u => u.email === email);

    if (user.points >= 50) {
        alert("Reward Collected 🎉");
        user.points -= 50;
    } else {
        alert("Need at least 50 points");
    }

    document.getElementById("rewardPoints").innerText =
        "Total Points: " + user.points;

    localStorage.setItem("users", JSON.stringify(users));

    generateCaptcha();
}