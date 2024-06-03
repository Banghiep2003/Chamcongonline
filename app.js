const scriptURL = 'https://script.google.com/macros/s/AKfycbyYae0pT3fLT7jT1xnZc-i8aNyf2dI-rGwdj1hxk_UAmvfoo9xNEUZiqD_OPIu7uUOl/exec';

const form = document.forms['contact-form'];

function getFormattedDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function calculateTimeDifference(checkinTime, checkoutTime) {
    const checkinDate = new Date(checkinTime);
    const checkoutDate = new Date(checkoutTime);

    const diffMs = checkoutDate - checkinDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60)); 
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)); 

    return `${diffHours}h ${diffMinutes}m`;
}

function validatePhoneNumber(phone) {
    const phoneRegex = /^0\d{9,11}$/;
    return phoneRegex.test(phone);
}

function validateName(name) {
    const nameRegex = /^[A-Za-zÀ-ÿ]/; 
    return nameRegex.test(name);
}

form.addEventListener('submit', e => {
    e.preventDefault();

    const formData = new FormData(form);
    const phone = formData.get('Số điện thoại');
    const name = formData.get('Họ và Tên');

    if (!validatePhoneNumber(phone)) {
        alert("Số điện thoại phải bắt đầu bằng số 0 và có từ 10 đến 12 chữ số.");
        return;
    }

    if (!validateName(name)) {
        alert("Họ và Tên phải bắt đầu bằng chữ cái.");
        return;
    }

    const currentDate = new Date().toDateString();

    const checkinKey = `${phone}-${name}-${currentDate}-checkin`;
    const checkoutKey = `${phone}-${name}-${currentDate}-checkout`;

    const previousCheckin = sessionStorage.getItem(checkinKey);
    const previousCheckout = sessionStorage.getItem(checkoutKey);

    if (previousCheckin && !previousCheckout) {
        const checkoutTime = getFormattedDateTime();
        const workingTime = calculateTimeDifference(previousCheckin, checkoutTime);

        formData.append('Thời Gian Checkout', checkoutTime);
        formData.append('Tổng Thời Gian Làm Việc', workingTime);
        sessionStorage.setItem(checkoutKey, 'true');

        fetch(scriptURL, { method: 'POST', body: formData })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response;
            })
            .then(() => {
                alert("Checkout Thành Công!");
                window.location.reload();
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert("Có lỗi xảy ra, vui lòng thử lại.");
            });
    } else {
        const checkinTime = getFormattedDateTime();
        formData.append('Thời Gian Checkin', checkinTime);
        sessionStorage.setItem(checkinKey, checkinTime);
        sessionStorage.removeItem(checkoutKey);

        fetch(scriptURL, { method: 'POST', body: formData })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response;
            })
            .then(() => {
                alert("Checkin Thành Công!");
                window.location.reload();
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert("Có lỗi xảy ra, vui lòng thử lại.");
            });
    }
});

document.getElementById('checkout').addEventListener('click', () => {
    const formData = new FormData(form);
    const phone = formData.get('Số điện thoại');
    const name = formData.get('Họ và Tên');

    if (!validatePhoneNumber(phone)) {
        alert("Số điện thoại phải bắt đầu bằng số 0 và có từ 10 đến 12 chữ số.");
        return;
    }

    if (!validateName(name)) {
        alert("Họ và Tên phải bắt đầu bằng chữ cái.");
        return;
    }

    const currentDate = new Date().toDateString();

    const checkinKey = `${phone}-${name}-${currentDate}-checkin`;
    const checkoutKey = `${phone}-${name}-${currentDate}-checkout`;

    const previousCheckin = sessionStorage.getItem(checkinKey);

    if (previousCheckin) {
        const checkoutTime = getFormattedDateTime();
        const workingTime = calculateTimeDifference(previousCheckin, checkoutTime);

        formData.append('Thời Gian Checkout', checkoutTime);
        formData.append('Tổng Thời Gian Làm Việc', workingTime);
        sessionStorage.setItem(checkoutKey, 'true');

        fetch(scriptURL, { method: 'POST', body: formData })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response;
            })
            .then(() => {
                alert("Checkout Thành Công!");
                window.location.reload();
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert("Có lỗi xảy ra, vui lòng thử lại.");
            });
    } else {
        alert("Hôm nay bạn chưa Checkin!.");
    }
});
