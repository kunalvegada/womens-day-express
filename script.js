import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 1. YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAi4DBUIOtMmNOkjsQSXW_EdT7yU36DKJA",
  authDomain: "ladies-special-express-26.firebaseapp.com",
  projectId: "ladies-special-express-26",
  storageBucket: "ladies-special-express-26.firebasestorage.app",
  messagingSenderId: "208345432745",
  appId: "1:208345432745:web:fbe7204c6f84ff2eb4dfb8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const carriagesCol = collection(db, "carriages");

let globalTrainData = [];

// 2. FORM LOGIC (Saves to the Cloud)
document.getElementById('submitBtn').onclick = function() {
    const fileInput = document.getElementById('photoInput');
    const senderInput = document.getElementById('senderName');
    const receiverInput = document.getElementById('receiverName');
    const msgInput = document.getElementById('msg');

    if(!fileInput.files[0] || !senderInput.value || !receiverInput.value) {
        return alert("Please fill the names and pick a photo! 🚂");
    }

    const reader = new FileReader();
    reader.onloadend = async function() {
        try {
            await addDoc(carriagesCol, {
                from: senderInput.value,
                to: receiverInput.value,
                message: msgInput.value || "Wishing you a wonderful day! 🌸",
                photo: reader.result,
                timestamp: serverTimestamp() 
            });

            // Visual feedback
            const counter = document.getElementById('coach-count');
            counter.classList.add('count-bump');
            setTimeout(() => counter.classList.remove('count-bump'), 300);

            // Reset form
            senderInput.value = ''; receiverInput.value = ''; msgInput.value = ''; fileInput.value = ''; 
            alert("Carriage joined the Global Express! 🌍");
        } catch (e) {
            alert("Error: Make sure your Firebase Rules are set to test mode!");
        }
    };
    reader.readAsDataURL(fileInput.files[0]);
};

// 3. RENDER FUNCTION
function renderTrain(data) {
    globalTrainData = data;
    const container = document.getElementById('carriage-container');
    container.innerHTML = '';
    document.getElementById('coach-count').innerText = data.length;
    
    data.forEach((item, index) => {
        const carriage = document.createElement('div');
        carriage.className = 'carriage-box';
        carriage.innerHTML = `
            <div class="tag-container">
                <div class="to-tag">To: ${item.to}</div>
                <div class="from-tag">By: ${item.from}</div>
            </div>
            <img src="${item.photo}" class="carriage-photo" onclick="openMsg(${index})">
            <div class="carriage-emoji">🚃</div>
        `;
        container.appendChild(carriage);
    });
    updateTrainSpeed(data.length);
}

// 4. POPUP & SPEED
window.openMsg = function(index) {
    const item = globalTrainData[index];
    let overlay = document.getElementById('msgOverlay');
    if(!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'msgOverlay';
        overlay.className = 'message-overlay';
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
        <div class="message-box">
            <h2 style="color: var(--accent);">🌸 For ${item.to} 🌸</h2>
            <p>"${item.message}"</p>
            <p><strong>— From ${item.from}</strong></p>
            <button class="close-btn" onclick="closeMsg()">Close 🚂</button>
        </div>
    `;
    overlay.style.display = 'flex';
    document.querySelector('.train-group').style.animationPlayState = 'paused';
};

window.closeMsg = function() {
    document.getElementById('msgOverlay').style.display = 'none';
    document.querySelector('.train-group').style.animationPlayState = 'running';
};

function updateTrainSpeed(count) {
    const train = document.querySelector('.train-group');
    if(!train) return;
    let newSpeed = 12 - (count * 1);
  if (newSpeed < 3) newSpeed = 3;
    train.style.animationDuration = newSpeed + "s";
}

// 5. THE GLOBAL LISTENER (Updates instantly for everyone)
onSnapshot(query(carriagesCol, orderBy("timestamp", "asc")), (snapshot) => {
    const data = snapshot.docs.map(doc => doc.data());
    renderTrain(data); 
});
