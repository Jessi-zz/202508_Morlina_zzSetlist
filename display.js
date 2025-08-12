document.addEventListener('DOMContentLoaded', () => {
    const sungSongsList = document.getElementById('sungSongsList');
    const scrollableArea = document.querySelector('.scrollable-area');
    const currentSong = document.getElementById('currentSong');
    const songList = document.querySelector('.song-list');
    const divider = document.querySelector('.divider');

    let lastUpdateTime = 0;
    let scrollDirection = 1;
    let scrollPosition = 0;
    let targetScrollPosition = 0; // 目標滾動位置
    let scrollInterval = null;
    let pauseCounter = 0;
    let isPaused = false;
    let maxScroll = 0; // 快取最大滾動值
    let scrollSpeed = parseFloat(localStorage.getItem('scrollSpeed')) || 0.3; // 動態滾動速度
    let lastCheckedSpeed = scrollSpeed; // 記錄上次檢查的速度
    let fontSize = parseFloat(localStorage.getItem('fontSize')) || 52; // 動態字體大小
    let lastCheckedFontSize = fontSize; // 記錄上次檢查的字體大小

    function updateDisplay() {
        const now = Date.now();
        if (now - lastUpdateTime < 200) return;
        lastUpdateTime = now;

        sungSongsList.innerHTML = '';
        const sungSongs = localStorage.getItem('sungSongs') || '';
        const currentSongText = localStorage.getItem('currentSong') || '';
        const allSongs = sungSongs.split('\n').filter(song => song.trim() !== '');
        
        const fragment = document.createDocumentFragment();
        
        allSongs.forEach((song, index) => {
            const li = document.createElement('li');
            const numberSpan = document.createElement('span');
            const textSpan = document.createElement('span');

            numberSpan.classList.add('song-number');
            textSpan.classList.add('song-text');

            if (song.startsWith('//')) {
                li.classList.add('special-format');
                textSpan.textContent = song.substring(2).trim();
            } else {
                textSpan.textContent = song.trim();
            }

            // 動態字體大小
            textSpan.style.fontSize = fontSize + 'px';

            li.appendChild(numberSpan);
            li.appendChild(textSpan);
            fragment.appendChild(li);
        });
        
        sungSongsList.appendChild(fragment);

        // 現正演唱顯示
        if (currentSongText.trim() !== '') {
            currentSong.innerHTML = `
                <span class="song-number"></span>
                <span class="song-text" style="font-size: ${fontSize}px;">${currentSongText.trim()}</span>
            `;
            currentSong.style.display = 'flex';
            
            if (divider) {
                divider.classList.add('show');
            }
        } else {
            currentSong.style.display = 'none';
            
            if (divider) {
                divider.classList.remove('show');
            }
        }
        setTimeout(checkScrollNecessity, 100);
    }

    function checkScrollSpeedChange() {
        const currentSpeed = parseFloat(localStorage.getItem('scrollSpeed')) || 0.3;
        if (currentSpeed !== lastCheckedSpeed) {
            scrollSpeed = currentSpeed;
            lastCheckedSpeed = currentSpeed;
            // console.log('滾動速度已更新為:', scrollSpeed);
        }
    }

    function checkFontSizeChange() {
        const currentFontSize = parseFloat(localStorage.getItem('fontSize')) || 52;
        if (currentFontSize !== lastCheckedFontSize) {
            fontSize = currentFontSize;
            lastCheckedFontSize = currentFontSize;
            // console.log('字體大小已更新為:', fontSize);
            updateDisplay();
        }
    }

    function smoothAutoScroll() {
        if (maxScroll <= 0) return;

        if (isPaused) {
            // 停頓邏輯
            pauseCounter++;
            if (pauseCounter >= 120) { // 停頓約2秒 (120 * 16.67ms ≈ 2s)
                isPaused = false;
                pauseCounter = 0;
                scrollDirection *= -1;
            }
            return;
        }

        // 動態滾動速度
        targetScrollPosition += scrollDirection * scrollSpeed;
        
        // 邊界檢查
        if (targetScrollPosition >= maxScroll) {
            targetScrollPosition = maxScroll;
            isPaused = true;
            pauseCounter = 0;
        } else if (targetScrollPosition <= 0) {
            targetScrollPosition = 0;
            isPaused = true;
            pauseCounter = 0;
        }

        // 緩動效果
        const difference = targetScrollPosition - scrollPosition;
        scrollPosition += difference * 0.8;
        scrollableArea.scrollTop = Math.round(scrollPosition);
    }

    function checkScrollNecessity() {
        maxScroll = Math.max(0, songList.scrollHeight - scrollableArea.clientHeight);
        
        if (maxScroll > 0) {
            if (!scrollInterval) {
                scrollInterval = setInterval(smoothAutoScroll, 16); // 60fps
                scrollPosition = 0;
                targetScrollPosition = 0;
                scrollDirection = 1;
                isPaused = false;
                pauseCounter = 0;
            }
        } else {
            clearInterval(scrollInterval);
            scrollInterval = null;
            scrollPosition = 0;
            targetScrollPosition = 0;
            isPaused = false;
            pauseCounter = 0;
        }
    }

    // 禁用用戶滾動
    if (scrollableArea) {
        scrollableArea.addEventListener('wheel', (e) => {
            e.preventDefault();
        }, { passive: false });

        scrollableArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });

        scrollableArea.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        scrollableArea.addEventListener('keydown', (e) => {
            const blockedKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'];
            if (blockedKeys.includes(e.code)) {
                e.preventDefault();
            }
        });


        scrollableArea.addEventListener('scroll', (e) => {
            if (Math.abs(scrollableArea.scrollTop - scrollPosition) > 5) {
                scrollableArea.scrollTop = Math.round(scrollPosition);
            }
        }, { passive: true });
    }

    updateDisplay();
    window.addEventListener('storage', updateDisplay);
    window.addEventListener('songlistupdate', updateDisplay);
    window.addEventListener('fontsizeupdate', checkFontSizeChange);
    setInterval(() => {
        updateDisplay();
        checkScrollSpeedChange();
        checkFontSizeChange(); 
    }, 1000); 

    setInterval(() => {
        checkScrollSpeedChange();
        checkFontSizeChange();
    }, 200); // 每200ms檢查一次變化
});