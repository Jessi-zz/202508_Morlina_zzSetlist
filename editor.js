document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const editPage = document.getElementById('editPage');
    const settingsPage = document.getElementById('settingsPage');
    
    // 歌單相關元素
    const upcomingSongs = document.getElementById('upcomingSongs');
    const sungSongs = document.getElementById('sungSongs');
    const currentSongInput = document.getElementById('currentSong');
    
    // 按鈕元素
    const nextSongBtn = document.getElementById('nextSongBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const setListBtn = document.getElementById('setListBtn');
    const backBtn = document.getElementById('backBtn');
    const creditBtn = document.getElementById('creditBtn');
    const creditBtn2 = document.getElementById('creditBtn2');
    const clearBtn = document.getElementById('clearBtn');
    
    // 設定相關元素
    const scrollSpeedSlider = document.getElementById('scrollSpeed');
    const fontSizeSlider = document.getElementById('fontSize');
    const resetSpeedBtn = document.getElementById('resetSpeedBtn');
    const resetFontBtn = document.getElementById('resetFontBtn');

    // 載入儲存的數據
    function loadData() {
        upcomingSongs.value = localStorage.getItem('upcomingSongs') || '';
        sungSongs.value = localStorage.getItem('sungSongs') || '';
        currentSongInput.value = localStorage.getItem('currentSong') || '';
        
        // 載入設定
        const savedSpeed = localStorage.getItem('scrollSpeed') || '0.3';
        const savedFontSize = localStorage.getItem('fontSize') || '52';
        scrollSpeedSlider.value = savedSpeed;
        fontSizeSlider.value = savedFontSize;
    }

    // 更新 localStorage
    function updateLocalStorage() {
        localStorage.setItem('upcomingSongs', upcomingSongs.value);
        localStorage.setItem('sungSongs', sungSongs.value);
        localStorage.setItem('currentSong', currentSongInput.value);
        // 觸發自定義事件
        window.dispatchEvent(new Event('songlistupdate'));
    }

    // 更新滾動速度
    function updateScrollSpeed() {
        const speed = scrollSpeedSlider.value;
        localStorage.setItem('scrollSpeed', speed);
        window.dispatchEvent(new Event('scrollspeedupdate'));
    }

    // 更新字體大小
    function updateFontSize() {
        const fontSize = fontSizeSlider.value;
        localStorage.setItem('fontSize', fontSize);
        window.dispatchEvent(new Event('fontsizeupdate'));
    }

    // 重置滾動速度
    function resetScrollSpeed() {
        scrollSpeedSlider.value = '0.3';
        updateScrollSpeed();
    }

    // 重置字體大小
    function resetFontSize() {
        fontSizeSlider.value = '52';
        updateFontSize();
    }

    // 下一首歌曲
    function nextSong() {
        if (currentSongInput.value.trim() !== '') {
            // 如果當前有歌曲，將其添加到已唱歌單的尾部，然後清空當前歌曲
            sungSongs.value = (sungSongs.value.trim() + '\n' + currentSongInput.value.trim()).trim();
            currentSongInput.value = '';
        } else {
            // 如果當前沒有歌曲，則從準備歌單中取出下一首
            const upcomingSongsArray = upcomingSongs.value.split('\n');
            if (upcomingSongsArray.length > 0 && upcomingSongsArray[0].trim() !== '') {
                currentSongInput.value = upcomingSongsArray.shift().trim();
                upcomingSongs.value = upcomingSongsArray.join('\n');
            }
        }
        updateLocalStorage();
    }

    // 頁面切換函數
    function showEditPage() {
        editPage.classList.add('active');
        settingsPage.classList.remove('active');
        setTimeout(() => {
            settingsPage.classList.remove('slide-left');
        }, 300);
    }

    function showSettingsPage() {
        settingsPage.classList.add('active');
        editPage.classList.remove('active');
        editPage.classList.add('slide-left');
        setTimeout(() => {
            editPage.classList.remove('slide-left');
        }, 300);
    }

    // 清除所有歌單資料
    function clearAllData() {
        // 顯示確認對話框
        if (confirm('確定清除歌單？')) {
            // 清空所有輸入框
            upcomingSongs.value = '';
            sungSongs.value = '';
            currentSongInput.value = '';
            
            // 更新 localStorage
            updateLocalStorage();
            
            // 可選：顯示成功訊息
            console.log('歌單已清除');
        }
    }

    // 開啟推特
    function openTwitter() {
        window.open('https://x.com/zzTajuhn', '_blank');
    }

    // 事件監聽器
    nextSongBtn.addEventListener('click', nextSong);
    settingsBtn.addEventListener('click', showSettingsPage);
    setListBtn.addEventListener('click', showEditPage);
    backBtn.addEventListener('click', showEditPage);
    creditBtn.addEventListener('click', openTwitter);
    creditBtn2.addEventListener('click', openTwitter);
    clearBtn.addEventListener('click', clearAllData);

    // 設定控制事件
    scrollSpeedSlider.addEventListener('input', updateScrollSpeed);
    fontSizeSlider.addEventListener('input', updateFontSize);
    resetSpeedBtn.addEventListener('click', resetScrollSpeed);
    resetFontBtn.addEventListener('click', resetFontSize);

    // 自動更新歌單
    upcomingSongs.addEventListener('input', updateLocalStorage);
    sungSongs.addEventListener('input', updateLocalStorage);
    currentSongInput.addEventListener('input', updateLocalStorage);

    // 初始化
    loadData();

    // 重置所有儲存的功能（調試用）
    function resetStorage() {
        localStorage.clear();
        window.location.reload();
    }

    // 鍵盤快捷鍵（可選）
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter 執行下一首
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            nextSong();
        }
        // Esc 返回歌單頁面
        if (e.key === 'Escape' && settingsPage.classList.contains('active')) {
            showEditPage();
        }
    });
});