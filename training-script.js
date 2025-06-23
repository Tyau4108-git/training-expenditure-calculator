// グローバル変数
let trainingSectionsContainer;
let trainingSections;
let sectionCaloriesContainer;
let additionalSectionCount = 0;
let draggedSection = null;
let trainingResultCard;
let totalCaloriesResult;
let menuResults;
let existingSectionIds = ['warmup', 'main', 'cooldown'];
let sectionResults = [];
let metsDataCheckAttempts = 0;

// タッチデバイスかどうかを判定
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

document.addEventListener('DOMContentLoaded', () => {
    // トレーニング消費量計算用の要素
    const trainingTab = document.getElementById('training-tab');
    const trainingForm = document.getElementById('training-form');
    
    // トレーニング結果カードを初期化
    trainingResultCard = document.getElementById('training-result-card');
    
    // トレーニングセクション関連
    trainingSectionsContainer = document.getElementById('training-sections-container');
    sectionCaloriesContainer = document.getElementById('section-calories-container');
    
    // トレーニング消費量計算結果表示要素
    totalCaloriesResult = document.getElementById('total-calories-result');
    menuResults = document.getElementById('menu-results');

    // 最初は結果カードを非表示
    if (trainingResultCard) {
        trainingResultCard.style.display = 'none';
    }

    // 初期化処理
    initializeTrainingForm();
    checkMetsDataLoaded();
    fixMobileScroll();

    function fixMobileScroll() {
        // タッチデバイスかどうかを確認
        if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
            return;
        }
        
        // トレーニングタブがアクティブな時のスクロール問題を修正
        const trainingTab = document.getElementById('training-tab');
        const trainingCalculator = document.getElementById('training-calculator');
        const trainingSectionsContainer = document.getElementById('training-sections-container');
        
        if (trainingTab && trainingCalculator) {
            // タブ切り替え時にスクロール設定をリセット
            trainingTab.addEventListener('click', function() {
                setTimeout(() => {
                    // bodyのスクロールを確実に有効化
                    document.body.style.overflow = 'auto';
                    document.body.style.position = 'relative';
                    document.body.style.height = 'auto';
                    
                    // コンテナのスクロールも有効化
                    if (trainingSectionsContainer) {
                        trainingSectionsContainer.style.overflow = 'visible';
                        trainingSectionsContainer.style.height = 'auto';
                        trainingSectionsContainer.style.minHeight = 'auto';
                    }
                    
                    // iOSのスクロール問題を回避
                    document.documentElement.style.overflow = 'auto';
                    document.documentElement.style.height = 'auto';
                }, 100);
                // 既に選択されている値がある場合
            if (select.value) {
                searchInput.value = select.value;
                clearButton.style.display = 'flex';
                updateSelectedDisplay(selectedDisplay, select.value);
            }
        }
        
        // タッチイベントの処理を改善
        if (trainingSectionsContainer) {
            let touchStartY = 0;
            let touchEndY = 0;
            
            // タッチ開始時の処理
            trainingSectionsContainer.addEventListener('touchstart', function(e) {
                touchStartY = e.touches[0].clientY;
            }, { passive: true });
            
            // タッチ移動時の処理
            trainingSectionsContainer.addEventListener('touchmove', function(e) {
                touchEndY = e.touches[0].clientY;
                
                // スクロール方向を検出
                const scrollDirection = touchStartY - touchEndY;
                
                // ページ全体のスクロールを許可
                if (Math.abs(scrollDirection) > 10) {
                    e.stopPropagation();
                }
            }, { passive: true });
        }
        
        // 入力フィールドのフォーカス時の処理
        document.addEventListener('focusin', function(e) {
            if (e.target.matches('input, select, textarea')) {
                // フォーカス時もスクロールを維持
                document.body.style.overflow = 'auto';
                
                // iOS Safariでキーボード表示時のスクロール問題を回避
                setTimeout(() => {
                    if (window.visualViewport) {
                        const viewportHeight = window.visualViewport.height;
                        const elementBottom = e.target.getBoundingClientRect().bottom;
                        
                        if (elementBottom > viewportHeight) {
                            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }, 300);
            }
        });
        
        // フォーカスが外れた時の処理
        document.addEventListener('focusout', function(e) {
            if (e.target.matches('input, select, textarea')) {
                // スクロール位置を保持
                const scrollY = window.scrollY;
                
                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                    document.body.style.overflow = 'auto';
                }, 100);
            }
        });
    }

    function initializeTrainingForm() {
        console.log('トレーニングフォーム初期化開始');
        
        const trainingFormElement = document.getElementById('training-form');
        
        if (!trainingFormElement) {
            console.error('トレーニングフォーム要素が見つかりません');
            return;
        }
        
        // イベントリスナーを設定
        trainingFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('トレーニングフォームのsubmitイベントが発火しました');
            calculateTrainingCalories();
        });
        
        const calculateBtn = trainingFormElement.querySelector('.calculate-btn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('計算ボタンがクリックされました');
                calculateTrainingCalories();
            });
        }
        
        const addMenuBtn = document.getElementById('add-training-menu-btn');
        if (addMenuBtn) {
            addMenuBtn.addEventListener('click', function(e) {
                e.preventDefault();
                addTrainingMenu();
            });
        }
        
        const existingRemoveBtns = document.querySelectorAll('.remove-section-btn');
        existingRemoveBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionIdToRemove = this.getAttribute('data-section-id');
                removeTrainingSection(sectionIdToRemove);
            });
        });
        
        // モバイル向けドラッグ&ドロップ機能を初期化
        if (isTouchDevice) {
            initMobileDragAndDrop();
        } else {
            initDragAndDrop();
        }
        
        initMenuForm();
        
        if (typeof metsData !== 'undefined' && metsData.activities && metsData.activities.length > 0) {
            populateActivitySelects();
        }
        
        console.log('トレーニングフォーム初期化完了');
    }

    // モバイル向けドラッグ&ドロップ機能
    function initMobileDragAndDrop() {
        console.log('モバイル向けドラッグ&ドロップ機能を初期化');
        
        const container = document.getElementById('training-sections-container');
        trainingSections = document.querySelectorAll('.training-section');
        
        // ドラッグハンドルを非表示にする
        trainingSections.forEach(section => {
            const handle = section.querySelector('.training-section-handle');
            if (handle) {
                handle.style.display = 'none';
            }
        });
        
        // 並び替えボタンを追加
        addSortButtons();
    }

    // 並び替えボタンを追加する関数
    function addSortButtons() {
        const sections = document.querySelectorAll('.training-section');
        
        sections.forEach((section, index) => {
            // 既存のボタンがある場合は削除
            const existingButtons = section.querySelectorAll('.mobile-sort-btn');
            existingButtons.forEach(btn => btn.remove());
            
            // ボタンコンテナを作成
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'mobile-sort-buttons';
            
            // 上に移動ボタン
            if (index > 0) {
                const upButton = document.createElement('button');
                upButton.className = 'mobile-sort-btn sort-up-btn';
                upButton.innerHTML = '↑';
                upButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveSection(section, 'up');
                });
                buttonContainer.appendChild(upButton);
            }
            
            // 下に移動ボタン
            if (index < sections.length - 1) {
                const downButton = document.createElement('button');
                downButton.className = 'mobile-sort-btn sort-down-btn';
                downButton.innerHTML = '↓';
                downButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveSection(section, 'down');
                });
                buttonContainer.appendChild(downButton);
            }
            
            // セクションタイトルの横にボタンを配置
            const titleContainer = section.querySelector('.section-title-container');
            if (titleContainer) {
                titleContainer.appendChild(buttonContainer);
            }
        });
    }

    // セクションを移動する関数
    function moveSection(section, direction) {
        const container = document.getElementById('training-sections-container');
        const sections = Array.from(container.querySelectorAll('.training-section'));
        const currentIndex = sections.indexOf(section);
        
        if (direction === 'up' && currentIndex > 0) {
            container.insertBefore(section, sections[currentIndex - 1]);
        } else if (direction === 'down' && currentIndex < sections.length - 1) {
            container.insertBefore(sections[currentIndex + 1], section);
        }
        
        // ボタンを再配置
        addSortButtons();
        
        // 結果表示の順序を更新
        updateMenuResultsOrder();
    }

    // デスクトップ向けドラッグ&ドロップ機能（既存のコードを維持）
    function initDragAndDrop() {
        console.log('ドラッグ&ドロップ機能を初期化しています');
        const container = document.getElementById('training-sections-container');
        trainingSections = document.querySelectorAll('.training-section');
        
        addDragAndDropStyles();
        
        trainingSections.forEach(section => {
            const handle = section.querySelector('.training-section-handle');
            
            if (handle) {
                handle.style.cursor = 'grab';
                handle.title = 'ドラッグしてメニューの順序を変更';
                handle.classList.add('draggable-handle');
                
                handle.removeEventListener('mousedown', handleDragStart);
                handle.addEventListener('mousedown', handleDragStart);
            }
        });
        
        if (container) {
            container.removeEventListener('dragover', handleDragOver);
            container.addEventListener('dragover', handleDragOver);
            
            container.removeEventListener('drop', handleDrop);
            container.addEventListener('drop', handleDrop);
        }
        
        document.removeEventListener('dragend', handleDragEnd);
        document.addEventListener('dragend', handleDragEnd);
    }

    function handleDragStart(e) {
        const section = this.closest('.training-section');
        if (!section) return;
        
        draggedSection = section;
        this.style.cursor = 'grabbing';
        section.setAttribute('draggable', 'true');
        
        section.ondragstart = function(event) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', '');
            section.classList.add('dragging');
            
            const allSections = document.querySelectorAll('.training-section');
            allSections.forEach(s => {
                s.style.zIndex = s === section ? '10' : '1';
            });
        };
        
        document.addEventListener('mouseup', function onMouseUp() {
            document.removeEventListener('mouseup', onMouseUp);
            if (section) {
                const handle = section.querySelector('.training-section-handle');
                if (handle) {
                    handle.style.cursor = 'grab';
                }
            }
        });
    }

    function handleDragEnd(e) {
        if (!draggedSection) return;
        
        draggedSection.classList.remove('dragging');
        draggedSection.setAttribute('draggable', 'false');
        
        const allSections = document.querySelectorAll('.training-section');
        allSections.forEach(section => {
            section.classList.add('drag-complete');
            setTimeout(() => {
                section.classList.remove('drag-complete');
            }, 500);
        });
        
        updateMenuResultsOrder();
        
        const finishedSection = draggedSection;
        draggedSection = null;
        
        const titleInput = finishedSection.querySelector('.section-title-input');
        if (titleInput) {
            const savedTitle = titleInput.value;
            setTimeout(() => {
                titleInput.value = savedTitle;
            }, 10);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const draggable = document.querySelector('.dragging');
        if (!draggable) return;
        
        const afterElement = getDragAfterElement(this, e.clientY);
        
        if (afterElement == null) {
            this.appendChild(draggable);
        } else {
            this.insertBefore(draggable, afterElement);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        console.log('アイテムがドロップされました');
        
        const draggable = document.querySelector('.dragging');
        if (draggable) {
            draggable.classList.remove('dragging');
            draggable.setAttribute('draggable', 'false');
        }
        
        updateMenuResultsOrder();
        draggedSection = null;
        
        return false;
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.training-section:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function addDragAndDropStyles() {
        const existingStyle = document.getElementById('drag-drop-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const styleEl = document.createElement('style');
        styleEl.id = 'drag-drop-styles';
        styleEl.textContent = `
            .draggable-handle {
                background-color: rgba(0, 150, 255, 0.1);
                border-radius: 4px;
                padding: 4px;
                margin: -4px;
                transition: all 0.2s ease;
            }
            
            .draggable-handle:hover {
                background-color: rgba(0, 150, 255, 0.2);
                transform: scale(1.1);
            }
            
            .draggable-handle:active {
                background-color: rgba(0, 150, 255, 0.3);
                cursor: grabbing;
            }
            
            .training-section {
                transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
                position: relative;
                z-index: 1;
            }
            
            .training-section.dragging {
                background-color: rgba(0, 150, 255, 0.1);
                transform: scale(1.02);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
                z-index: 10;
                opacity: 0.9;
            }
            
            .training-section.drag-complete {
                animation: pulse 0.5s ease;
            }
            
            @keyframes pulse {
                0% { background-color: rgba(0, 150, 255, 0); }
                50% { background-color: rgba(0, 150, 255, 0.2); }
                100% { background-color: rgba(0, 150, 255, 0); }
            }
            
            /* モバイル向けソートボタンのスタイル */
            .mobile-sort-buttons {
                display: flex;
                gap: 0.5rem;
                margin-left: auto;
            }
            
            .mobile-sort-btn {
                width: 30px;
                height: 30px;
                padding: 0;
                background-color: rgba(45, 212, 191, 0.2);
                border: 1px solid var(--secondary-color);
                color: var(--secondary-color);
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .mobile-sort-btn:hover,
            .mobile-sort-btn:active {
                background-color: rgba(45, 212, 191, 0.3);
                transform: scale(1.1);
            }
            
            @media (min-width: 769px) {
                .mobile-sort-buttons {
                    display: none;
                }
            }
            
            @media (max-width: 768px) {
                .draggable-handle {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(styleEl);
    }

    function removeTrainingSection(sectionId) {
        if (['warmup', 'main', 'cooldown'].includes(sectionId)) {
            alert('デフォルトのトレーニングメニューは削除できません。');
            return;
        }
        
        const sectionToRemove = document.querySelector(`.training-section[data-section-id="${sectionId}"]`);
        if (sectionToRemove) {
            sectionToRemove.remove();
        }
        
        const resultItemToRemove = document.querySelector(`.details-item[data-section-id="${sectionId}"]`);
        if (resultItemToRemove) {
            resultItemToRemove.remove();
        }
        
        const index = existingSectionIds.indexOf(sectionId);
        if (index !== -1) {
            existingSectionIds.splice(index, 1);
        }
        
        const sections = document.querySelectorAll('.training-section');
        sections.forEach((section, index) => {
            const titleInput = section.querySelector('.section-title-input');
            if (titleInput && titleInput.value.match(/^トレーニングメニュー\d+$/)) {
                const newTitle = `トレーニングメニュー${index + 1}`;
                titleInput.value = newTitle;
                
                const sectionId = section.getAttribute('data-section-id');
                const resultTitle = document.querySelector(`.training-menu-title[data-section-id="${sectionId}"]`);
                if (resultTitle) {
                    resultTitle.textContent = newTitle;
                }
            }
        });
        
        // モバイルの場合はソートボタンを再配置
        if (isTouchDevice) {
            addSortButtons();
        } else {
            initDragAndDrop();
        }
        
        console.log(`トレーニングメニューが削除されました: ${sectionId}`);
    }

    function addTrainingMenu() {
        additionalSectionCount++;
        const newSectionId = `menu-${additionalSectionCount}`;
        
        const currentSections = document.querySelectorAll('.training-section');
        const menuNumber = currentSections.length + 1;
        
        const newSection = document.createElement('div');
        newSection.className = 'training-section';
        newSection.setAttribute('data-section-id', newSectionId);
        
        newSection.innerHTML = `
            <div class="training-section-handle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
                </svg>
            </div>
            <div class="section-title-container">
                <input type="text" class="section-title-input" value="トレーニングメニュー${menuNumber}" 
                       data-section-id="${newSectionId}" placeholder="トレーニング名を入力">
            </div>
            <div class="form-group">
                <label for="${newSectionId}-activity">種類</label>
                <select id="${newSectionId}-activity" name="${newSectionId}-activity" class="section-activity">
                    <option value="">-- 選択してください --</option>
                </select>
            </div>
            <div class="form-group">
                <label for="${newSectionId}-duration">時間 (分)</label>
                <input type="number" id="${newSectionId}-duration" name="${newSectionId}-duration" min="0" max="300" class="section-duration">
            </div>
            <div class="form-group">
                <button type="button" class="remove-section-btn cyber-btn" data-section-id="${newSectionId}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    <span>削除</span>
                </button>
            </div>
        `;
        
        const container = document.getElementById('training-sections-container');
        if (container) {
            container.appendChild(newSection);
        }
        
        existingSectionIds.push(newSectionId);
        
        if (typeof metsData !== 'undefined' && metsData.activities && metsData.activities.length > 0) {
            populateActivitySelects();
        }
        
        // モバイルの場合はソートボタンを追加
        if (isTouchDevice) {
            addSortButtons();
        } else {
            initDragAndDrop();
        }
        
        initMenuForm();
        
        const removeBtn = newSection.querySelector('.remove-section-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionIdToRemove = this.getAttribute('data-section-id');
                removeTrainingSection(sectionIdToRemove);
            });
        }

        if (sectionCaloriesContainer) {
            const resultItem = document.createElement('div');
            resultItem.className = 'details-item';
            resultItem.setAttribute('data-section-id', newSectionId);
            resultItem.innerHTML = `
                <h4 class="training-menu-title" data-section-id="${newSectionId}">トレーニングメニュー${menuNumber}</h4>
                <p id="${newSectionId}-calories">- kcal</p>
            `;
            sectionCaloriesContainer.appendChild(resultItem);
        }
        
        console.log(`新しいトレーニングメニューが追加されました: ${newSectionId}`);
    }

    function populateActivitySelects() {
        const activitySelects = document.querySelectorAll('select.section-activity');
        if (activitySelects.length === 0) {
            console.warn('アクティビティセレクトボックスが見つかりません');
            return;
        }
        activitySelects.forEach(select => {
            // 既に処理済みの場合はスキップ
            if (select.parentElement.classList.contains('activity-select-container')) {
                return;
            }
            
            select.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- 選択してください --';
            select.appendChild(defaultOption);
            
            metsData.activities.forEach(activity => {
                const option = document.createElement('option');
                option.value = activity.description_ja;
                option.textContent = `${activity.description_ja} (METs: ${activity.mets})`;
                select.appendChild(option);
            });
            
            // セレクトボックスを非表示にする
            select.style.display = 'none';
            
            const container = document.createElement('div');
            container.className = 'activity-select-container';
            select.parentNode.insertBefore(container, select);
            container.appendChild(select);
            
            // 検索入力のラッパー
            const searchWrapper = document.createElement('div');
            searchWrapper.className = 'search-input-wrapper';
            
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'activity-search-input';
            searchInput.placeholder = '運動を検索または選択...';
            searchInput.setAttribute('autocomplete', 'off');
            
            // 検索アイコン
            const searchIcon = document.createElement('div');
            searchIcon.className = 'search-icon';
            searchIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m3-8a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/>
                </svg>
            `;
            
            // クリアボタン（最初は非表示）
            const clearButton = document.createElement('button');
            clearButton.className = 'clear-button';
            clearButton.style.display = 'none';
            clearButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/>
                </svg>
            `;
            
            searchWrapper.appendChild(searchIcon);
            searchWrapper.appendChild(searchInput);
            searchWrapper.appendChild(clearButton);
            container.insertBefore(searchWrapper, select);
            
            // 検索結果表示用のコンテナを追加
            const searchResults = document.createElement('div');
            searchResults.className = 'activity-search-results';
            searchResults.style.display = 'none';
            container.appendChild(searchResults);
            
            // 選択された値を表示するエリア
            const selectedDisplay = document.createElement('div');
            selectedDisplay.className = 'selected-activity-display';
            selectedDisplay.style.display = 'none';
            container.insertBefore(selectedDisplay, searchResults);
            
            // クリアボタンのイベント
            clearButton.addEventListener('click', (e) => {
                e.preventDefault();
                searchInput.value = '';
                select.value = '';
                searchResults.style.display = 'none';
                clearButton.style.display = 'none';
                selectedDisplay.style.display = 'none';
                searchInput.focus();
            });
            
            // 検索機能の実装
            let searchTimeout;
            let isResultsOpen = false;
            
            // タッチデバイス用のフラグ
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const searchTerm = e.target.value.trim();
                
                // クリアボタンの表示制御
                clearButton.style.display = searchTerm.length > 0 ? 'flex' : 'none';
                
                if (searchTerm.length === 0) {
                    searchResults.style.display = 'none';
                    isResultsOpen = false;
                    return;
                }
                
                // 入力後少し待ってから検索を実行（パフォーマンス向上）
                searchTimeout = setTimeout(() => {
                    const results = searchActivities(searchTerm);
                    displaySearchResults(results, searchResults, select, searchInput, selectedDisplay);
                    isResultsOpen = true;
                }, 300);
            });
            
            // 検索入力欄のフォーカス制御
            searchInput.addEventListener('focus', () => {
                searchWrapper.classList.add('focused');
                
                // モバイルでのスクロール位置調整
                if (isTouchDevice) {
                    setTimeout(() => {
                        const rect = searchWrapper.getBoundingClientRect();
                        const viewportHeight = window.innerHeight;
                        
                        // 検索ボックスが画面の上部に来るようにスクロール
                        if (rect.top > viewportHeight * 0.3) {
                            const scrollTop = window.pageYOffset + rect.top - 100;
                            window.scrollTo({
                                top: scrollTop,
                                behavior: 'smooth'
                            });
                        }
                    }, 300);
                }
                
                if (searchInput.value.trim().length > 0 && !select.value) {
                    const results = searchActivities(searchInput.value.trim());
                    displaySearchResults(results, searchResults, select, searchInput, selectedDisplay);
                    isResultsOpen = true;
                }
            });
            
            searchInput.addEventListener('blur', () => {
                searchWrapper.classList.remove('focused');
                
                // モバイルでの検索結果を閉じるタイミングを遅延
                if (isTouchDevice) {
                    setTimeout(() => {
                        if (!container.contains(document.activeElement)) {
                            searchResults.style.display = 'none';
                            isResultsOpen = false;
                        }
                    }, 200);
                }
            });
            
            // クリック外で検索結果を閉じる（改善版）
            document.addEventListener('click', (e) => {
                // タッチデバイスでは遅延を設ける
                if (isTouchDevice) {
                    setTimeout(() => {
                        if (!container.contains(e.target) && isResultsOpen) {
                            searchResults.style.display = 'none';
                            isResultsOpen = false;
                            
                            // z-indexをリセット
                            const parentSection = container.closest('.training-section');
                            if (parentSection) {
                                parentSection.style.zIndex = '1';
                            }
                        }
                    }, 100);
                } else {
                    if (!container.contains(e.target) && isResultsOpen) {
                        searchResults.style.display = 'none';
                        isResultsOpen = false;
                        
                        // z-indexをリセット
                        const parentSection = container.closest('.training-section');
                        if (parentSection) {
                            parentSection.style.zIndex = '1';
                        }
                    }
                }
            });
            
            // タッチイベントの追加（モバイル専用）
            if (isTouchDevice) {
                // 検索結果のタッチスクロールを改善
                searchResults.addEventListener('touchstart', (e) => {
                    // スクロール可能な要素でのタッチを許可
                    e.stopPropagation();
                }, { passive: true });
                
                // 検索入力欄のタッチ処理
                searchInput.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                }, { passive: true });
                
                // クリアボタンのタッチ処理
                clearButton.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                }, { passive: true });
            }
        });
    }
    
    // 高度な検索アルゴリズム
    function searchActivities(searchTerm) {
        const term = searchTerm.toLowerCase();
        const results = [];
        
        // 検索キーワードの同義語・関連語マッピング
        const synonyms = {
            'ランニング': ['走る', 'ジョギング', '走行', 'マラソン', 'ラン'],
            '水泳': ['泳ぐ', 'スイミング', 'プール', '泳ぎ'],
            'サッカー': ['フットボール', '蹴球'],
            '野球': ['ベースボール', 'キャッチボール'],
            'バスケ': ['バスケット', 'バスケットボール'],
            'テニス': ['硬式テニス', 'ソフトテニス'],
            '筋トレ': ['筋力トレーニング', 'ウェイトトレーニング', 'レジスタンストレーニング', 'ウェイト'],
            '自転車': ['サイクリング', 'バイク', '自転車こぎ'],
            'ウォーキング': ['歩く', '歩行', '散歩', 'ウォーク'],
            'ヨガ': ['ヨーガ', 'yoga'],
            'ダンス': ['踊る', 'ダンシング', '舞踊'],
            'エアロビ': ['エアロビクス', 'エアロビックダンス'],
            'ゴルフ': ['golf'],
            'スキー': ['スキーイング', 'skiing'],
            '登山': ['山登り', 'ハイキング', 'トレッキング'],
            '格闘技': ['武道', '武術', 'マーシャルアーツ'],
            'ボクシング': ['ボクササイズ', 'パンチ'],
            '腕立て': ['腕立て伏せ', 'プッシュアップ'],
            '腹筋': ['腹筋運動', 'シットアップ', 'クランチ'],
            '懸垂': ['チンニング', 'プルアップ']
        };
        
        // 検索用語を拡張
        const searchTerms = [term];
        for (const [key, values] of Object.entries(synonyms)) {
            if (key.includes(term) || term.includes(key)) {
                searchTerms.push(...values.map(v => v.toLowerCase()));
            }
            values.forEach(value => {
                if (value.toLowerCase().includes(term) || term.includes(value.toLowerCase())) {
                    searchTerms.push(key.toLowerCase());
                    searchTerms.push(...values.filter(v => v !== value).map(v => v.toLowerCase()));
                }
            });
        }
        
        // 重複を削除
        const uniqueSearchTerms = [...new Set(searchTerms)];
        
        metsData.activities.forEach((activity, index) => {
            const activityText = activity.description_ja.toLowerCase();
            let score = 0;
            
            // 完全一致
            if (activityText === term) {
                score = 1000;
            }
            // 開始一致
            else if (activityText.startsWith(term)) {
                score = 800;
            }
            // 含有チェック（メインキーワード）
            else if (activityText.includes(term)) {
                score = 600;
            }
            // 同義語・関連語での検索
            else {
                uniqueSearchTerms.forEach(searchTerm => {
                    if (activityText.includes(searchTerm)) {
                        score = Math.max(score, 400);
                    }
                });
            }
            
            // カテゴリー名での部分一致チェック
            if (score === 0) {
                const categoryId = getCategoryIdForActivity(activity);
                if (categoryId) {
                    const category = metsData.categories.find(cat => cat.id === categoryId);
                    if (category && category.name.toLowerCase().includes(term)) {
                        score = 200;
                    }
                }
            }
            
            // 単語の部分一致（最小3文字以上）
            if (score === 0 && term.length >= 3) {
                const words = activityText.split(/[、。・：\s]+/);
                words.forEach(word => {
                    if (word.includes(term) || term.includes(word)) {
                        score = Math.max(score, 100);
                    }
                });
            }
            
            if (score > 0) {
                results.push({
                    activity: activity,
                    score: score,
                    index: index
                });
            }
        });
        
        // スコアの高い順にソート
        results.sort((a, b) => b.score - a.score);
        
        // 上位20件を返す
        return results.slice(0, 20);
    }
    
    // アクティビティのカテゴリーIDを取得
    function getCategoryIdForActivity(activity) {
        // この実装は簡略化されています。実際にはmetsDataの構造に応じて調整が必要
        const activityIndex = metsData.activities.indexOf(activity);
        if (activityIndex === -1) return null;
        
        // カテゴリーの境界を推定（この部分は実際のデータ構造に合わせて調整が必要）
        if (activityIndex < 50) return '01'; // 自転車
        if (activityIndex < 120) return '02'; // コンディショニング運動
        if (activityIndex < 150) return '03'; // ダンス
        // ... 他のカテゴリーも同様に
        
        return null;
    }
    
    // 検索結果を表示（改善版）
    function displaySearchResults(results, resultsContainer, selectElement, searchInput, selectedDisplay) {
        resultsContainer.innerHTML = '';
        
        // 親要素のz-indexを管理
        const parentSection = resultsContainer.closest('.training-section');
        const allSections = document.querySelectorAll('.training-section');
        
        // すべてのセクションのz-indexをリセット
        allSections.forEach(section => {
            section.style.zIndex = '1';
        });
        
        // 現在のセクションを最前面に
        if (parentSection) {
            parentSection.style.zIndex = '500';
        }
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m3-8a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/>
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 10l4 4m0-4l-4 4"/>
                    </svg>
                    <p>該当する活動が見つかりませんでした</p>
                    <span>別のキーワードで検索してみてください</span>
                </div>
            `;
            resultsContainer.style.display = 'block';
            return;
        }
        
        // 結果をカテゴリー別にグループ化
        const groupedResults = {};
        results.forEach(result => {
            const categoryId = getCategoryIdForActivity(result.activity);
            const category = metsData.categories.find(cat => cat.id === categoryId) || { name: 'その他' };
            
            if (!groupedResults[category.name]) {
                groupedResults[category.name] = [];
            }
            groupedResults[category.name].push(result);
        });
        
        // カテゴリーごとに表示
        Object.entries(groupedResults).forEach(([categoryName, categoryResults]) => {
            if (categoryResults.length > 0) {
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'search-category-header';
                categoryHeader.textContent = categoryName;
                resultsContainer.appendChild(categoryHeader);
                
                categoryResults.forEach((result, index) => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'activity-result-item';
                    if (index === 0 && Object.keys(groupedResults).length === 1) {
                        resultItem.classList.add('first-result');
                    }
                    
                    // METs値に基づいて強度レベルを判定
                    const intensityLevel = getIntensityLevel(result.activity.mets);
                    
                    resultItem.innerHTML = `
                        <div class="activity-info">
                            <div class="activity-name">${highlightSearchTerm(result.activity.description_ja, searchInput.value)}</div>
                            <div class="activity-details">
                                <span class="activity-mets">METs: ${result.activity.mets}</span>
                                <span class="intensity-badge ${intensityLevel.class}">${intensityLevel.label}</span>
                            </div>
                        </div>
                        <svg class="select-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 18l6-6-6-6"/>
                        </svg>
                    `;
                    
                    resultItem.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        selectElement.value = result.activity.description_ja;
                        searchInput.value = result.activity.description_ja;
                        
                        // 選択された値を表示
                        updateSelectedDisplay(selectedDisplay, result.activity.description_ja, result.activity.mets);
                        
                        // クリアボタンを表示
                        const clearButton = searchInput.parentElement.querySelector('.clear-button');
                        if (clearButton) {
                            clearButton.style.display = 'flex';
                        }
                        
                        // 選択変更イベントを発火
                        const event = new Event('change', { bubbles: true });
                        selectElement.dispatchEvent(event);
                        
                        // アニメーション
                        resultItem.classList.add('selected');
                        
                        // モバイルでの処理
                        if (isTouchDevice) {
                            // フォーカスを外す
                            searchInput.blur();
                            
                            // キーボードを閉じる時間を確保
                            setTimeout(() => {
                                resultsContainer.style.display = 'none';
                                // z-indexをリセット
                                const parentSection = resultsContainer.closest('.training-section');
                                if (parentSection) {
                                    parentSection.style.zIndex = '1';
                                }
                            }, 100);
                        } else {
                            setTimeout(() => {
                                resultsContainer.style.display = 'none';
                                // z-indexをリセット
                                const parentSection = resultsContainer.closest('.training-section');
                                if (parentSection) {
                                    parentSection.style.zIndex = '1';
                                }
                            }, 200);
                        }
                    });
                    
                    resultsContainer.appendChild(resultItem);
                });
            }
        });
        
        resultsContainer.style.display = 'block';
        
        // スクロール位置をリセット
        resultsContainer.scrollTop = 0;
    }
    
    // 検索語をハイライト
    function highlightSearchTerm(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    // METs値から運動強度レベルを判定
    function getIntensityLevel(mets) {
        if (mets < 3) {
            return { label: '低強度', class: 'intensity-low' };
        } else if (mets < 6) {
            return { label: '中強度', class: 'intensity-medium' };
        } else if (mets < 9) {
            return { label: '高強度', class: 'intensity-high' };
        } else {
            return { label: '超高強度', class: 'intensity-very-high' };
        }
    }
    
    // 選択された活動を表示
    function updateSelectedDisplay(displayElement, activityName, metsValue) {
        if (!activityName) {
            displayElement.style.display = 'none';
            return;
        }
        
        const mets = metsValue || getMetsValueByActivityName(activityName);
        const intensity = getIntensityLevel(mets);
        
        displayElement.innerHTML = `
            <div class="selected-content">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"/>
                </svg>
                <span class="selected-text">${activityName}</span>
                <span class="selected-mets">METs: ${mets}</span>
                <span class="intensity-badge ${intensity.class}">${intensity.label}</span>
            </div>
        `;
        
        displayElement.style.display = 'block';
        displayElement.classList.add('fade-in');
    }

    function getMetsValueByActivityName(activityName) {
        if (typeof metsData !== 'undefined' && metsData.activities) {
            const activity = metsData.activities.find(a => a.description_ja === activityName);
            return activity ? activity.mets : null;
        } else {
            console.error('mets-data_latest.jsが正しく読み込まれていません');
            return null;
        }
    }

    function calculateTrainingCalories() {
        console.log('計算開始: calculateTrainingCalories()');
        
        if (!trainingResultCard) {
            trainingResultCard = document.getElementById('training-result-card');
        }
        
        if (!totalCaloriesResult) {
            totalCaloriesResult = document.getElementById('total-calories-result');
        }
        
        if (!menuResults) {
            menuResults = document.getElementById('menu-results');
        }
        
        if (!sectionCaloriesContainer) {
            sectionCaloriesContainer = document.getElementById('section-calories-container');
        }
        
        const weightInput = document.getElementById('training-weight');
        if (!weightInput || !weightInput.value) {
            alert('体重を入力してください');
            return;
        }
        
        const weight = parseFloat(weightInput.value);
        if (isNaN(weight) || weight <= 0) {
            alert('有効な体重を入力してください');
            return;
        }

        let totalCalories = 0;
        sectionResults = [];
        
        const sections = document.querySelectorAll('.training-section');
        let hasValidInput = false;
        
        console.log(`トレーニングセクション数: ${sections.length}`);
        
        sections.forEach((section, index) => {
            const sectionId = section.dataset.sectionId;
            const activitySelect = section.querySelector('.section-activity');
            const durationInput = section.querySelector('.section-duration');
            const titleInput = section.querySelector('.section-title-input');
            
            console.log(`セクション ${index+1} (ID: ${sectionId}) をチェック中`);
            
            if (!activitySelect || !durationInput) {
                console.log(`- セクション ${index+1}: 必要な要素が見つかりません`);
                return;
            }
            
            const activity = activitySelect.value;
            const duration = parseFloat(durationInput.value);
            const title = titleInput ? titleInput.value : 'トレーニングメニュー';
            
            console.log(`- セクション ${index+1}: 種類=${activity}, 時間=${duration}`);
            
            if (!activity || activity === '' || isNaN(duration) || duration <= 0) {
                console.log(`- セクション ${index+1}: 入力が不完全なのでスキップします`);
                return;
            }
            
            const metsValue = getMetsValueByActivityName(activity);
            if (!metsValue) {
                alert(`${activity}のMETs値が見つかりませんでした`);
                console.log(`- セクション ${index+1}: METs値が見つかりません`);
                return;
            }
            
            hasValidInput = true;
            console.log(`- セクション ${index+1}: 有効な入力です (METs=${metsValue})`);
            
            const durationHours = duration / 60;
            const calories = metsValue * weight * durationHours * 1.05;
            
            totalCalories += calories;
            
            sectionResults.push({
                id: sectionId,
                title: title,
                calories: Math.round(calories)
            });
        });
        
        if (!hasValidInput) {
            alert('少なくとも1つのトレーニングメニューに種類と時間を入力してください');
            console.log('有効な入力が1つもありません');
            return;
        }
        
        console.log(`計算完了: 総消費カロリー = ${Math.round(totalCalories)} kcal`);
        
        if (totalCaloriesResult) {
            totalCaloriesResult.textContent = `${Math.round(totalCalories)} kcal`;
            console.log('総消費カロリーを表示しました');
        } else {
            console.error('総消費カロリー表示要素が見つかりません');
        }
        
        updateSectionCalories();
        updateMenuResultsOrder();
        
        if (menuResults) {
            menuResults.style.display = 'block';
            console.log('メニュー別結果を表示しました');
        } else {
            console.error('メニュー別結果表示要素が見つかりません');
        }
        
        if (trainingResultCard) {
            console.log(`結果カード表示前の状態: ${trainingResultCard.style.display}`);
            trainingResultCard.style.display = 'block';
            trainingResultCard.setAttribute('data-has-results', 'true');
            console.log('結果カードを表示しました');
            
            trainingResultCard.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            console.error('結果カード表示要素が見つかりません (ID: training-result-card)');
        }
        
        console.log('計算完了: 全ての表示処理が終了しました');
    }

    function updateSectionCalories() {
        console.log('各セクションの消費カロリーを更新します');
        
        if (!sectionCaloriesContainer) {
            console.error('セクションカロリーコンテナが見つかりません');
            return;
        }
        
        sectionResults.forEach(result => {
            const caloriesElement = document.getElementById(`${result.id}-calories`);
            const titleElement = document.querySelector(`.training-menu-title[data-section-id="${result.id}"]`);
            
            if (caloriesElement) {
                caloriesElement.textContent = `${result.calories} kcal`;
                console.log(`セクション ${result.id} の消費カロリーを更新: ${result.calories} kcal`);
            }
            
            if (titleElement) {
                titleElement.textContent = result.title;
                console.log(`セクション ${result.id} のタイトルを更新: ${result.title}`);
            }
        });
        
        console.log('各セクションの消費カロリー更新完了');
    }

    function updateMenuResultsOrder() {
        console.log('メニュー結果の表示順序を更新します');
        const sectionsContainer = document.getElementById('training-sections-container');
        const sections = sectionsContainer.querySelectorAll('.training-section');
        const resultContainer = document.getElementById('section-calories-container');
        
        const existingResultItems = {};
        resultContainer.querySelectorAll('.details-item').forEach(item => {
            const sectionId = item.getAttribute('data-section-id');
            if (sectionId) {
                existingResultItems[sectionId] = item;
            }
        });
        
        sections.forEach((section, index) => {
            const sectionId = section.getAttribute('data-section-id');
            
            const titleInput = section.querySelector('.section-title-input');
            if (titleInput && titleInput.value.startsWith('トレーニングメニュー')) {
                const newTitle = `トレーニングメニュー${index + 1}`;
                titleInput.value = newTitle;
                
                const resultItem = existingResultItems[sectionId];
                if (resultItem) {
                    const titleElement = resultItem.querySelector('.training-menu-title');
                    if (titleElement) {
                        titleElement.textContent = newTitle;
                    }
                }
            }
            
            if (titleInput) {
                const resultItem = existingResultItems[sectionId];
                if (resultItem) {
                    const titleElement = resultItem.querySelector('.training-menu-title');
                    if (titleElement) {
                        titleElement.textContent = titleInput.value;
                    }
                }
            }
            
            if (existingResultItems[sectionId]) {
                resultContainer.appendChild(existingResultItems[sectionId]);
            } else {
                console.log(`セクション ${sectionId} の結果表示要素を新規作成`);
                createResultItemForSection(section, sectionId, resultContainer);
            }
        });
        
        console.log('メニュー結果の表示順序を更新しました');
    }

    function createResultItemForSection(section, sectionId, resultContainer) {
        const titleInput = section.querySelector('.section-title-input');
        const title = titleInput ? titleInput.value : 'トレーニングメニュー';
        
        const detailItem = document.createElement('div');
        detailItem.className = 'details-item';
        detailItem.setAttribute('data-section-id', sectionId);
        
        const titleElement = document.createElement('h4');
        titleElement.className = 'training-menu-title';
        titleElement.setAttribute('data-section-id', sectionId);
        titleElement.textContent = title;
        
        const caloriesElement = document.createElement('p');
        caloriesElement.id = `${sectionId}-calories`;
        
        const sectionResult = sectionResults.find(result => result.id === sectionId);
        if (sectionResult) {
            caloriesElement.textContent = `${sectionResult.calories} kcal`;
        } else {
            caloriesElement.textContent = '- kcal';
        }
        
        detailItem.appendChild(titleElement);
        detailItem.appendChild(caloriesElement);
        resultContainer.appendChild(detailItem);
        
        return detailItem;
    }

    function initMenuForm() {
        console.log('メニューフォーム機能を初期化します');
        document.querySelectorAll('.section-title-input').forEach(input => {
            input.removeEventListener('input', handleTitleInput);
            input.addEventListener('input', handleTitleInput);
            
            input.removeEventListener('change', handleTitleChange);
            input.addEventListener('change', handleTitleChange);
            
            // モバイルでの入力問題を修正
            input.addEventListener('focus', function() {
                this.setAttribute('data-focused', 'true');
            });
            
            input.addEventListener('blur', function() {
                this.removeAttribute('data-focused');
                // 入力値を確実に保存
                const value = this.value;
                setTimeout(() => {
                    if (this.value !== value) {
                        this.value = value;
                    }
                }, 100);
            });
        });
        
        document.removeEventListener('input', handleGlobalInput);
        document.addEventListener('input', handleGlobalInput);
        
        console.log('メニューフォーム機能の初期化が完了しました');
    }

    function handleTitleInput(e) {
        if (!e.target.classList.contains('section-title-input')) return;
        
        const sectionId = e.target.getAttribute('data-section-id');
        const newTitle = e.target.value;
        
        updateMenuTitle(sectionId, newTitle);
    }

    function handleTitleChange(e) {
        if (!e.target.classList.contains('section-title-input')) return;
        
        const sectionId = e.target.getAttribute('data-section-id');
        const newTitle = e.target.value;
        
        updateMenuTitle(sectionId, newTitle);
        updateSectionResultTitle(sectionId, newTitle);
    }

    function handleGlobalInput(e) {
        if (!e.target.classList.contains('section-title-input')) return;
        
        const sectionId = e.target.getAttribute('data-section-id');
        const newTitle = e.target.value;
        
        updateMenuTitle(sectionId, newTitle);
    }

    function updateMenuTitle(sectionId, newTitle) {
        const titleElements = document.querySelectorAll(`.training-menu-title[data-section-id="${sectionId}"]`);
        titleElements.forEach(el => {
            el.textContent = newTitle;
        });
    }

    function updateSectionResultTitle(sectionId, newTitle) {
        for (let i = 0; i < sectionResults.length; i++) {
            if (sectionResults[i].id === sectionId) {
                sectionResults[i].title = newTitle;
                break;
            }
        }
    }
});

function checkMetsDataLoaded() {
    if (typeof metsData !== 'undefined' && metsData.activities && metsData.activities.length > 0) {
        console.log('METs情報を検証: 正常に読み込まれました (' + metsData.activities.length + '件)');
        const populateFunc = window.populateActivitySelects;
        if (typeof populateFunc === 'function') {
            populateFunc();
        }
        return true;
    } else {
        metsDataCheckAttempts++;
        if (metsDataCheckAttempts < 15) {
            console.log('METs情報の読み込みを待機中... 試行回数: ' + metsDataCheckAttempts);
            setTimeout(checkMetsDataLoaded, 500);
        } else {
            console.error('METs情報の読み込みに失敗しました。ページをリロードしてください。', typeof metsData);
            alert('運動データの読み込みに失敗しました。ページをリロードしてください。');
        }
        return false;
    }
}

// グローバルに関数を公開
window.populateActivitySelects = function() {
    const func = document.querySelector('[data-populate-func]');
    if (func && typeof func.populateActivitySelects === 'function') {
        func.populateActivitySelects();
    }
};

window.addEventListener('load', function() {
    console.log('ページ読み込み完了：初期化処理を実行します');
    
    if (typeof metsData !== 'undefined' && metsData.activities && metsData.activities.length > 0) {
        console.log('METs情報：すでに読み込まれています');
        const populateFunc = window.populateActivitySelects;
        if (typeof populateFunc === 'function') {
            populateFunc();
        }
    } else {
        console.log('METs情報：読み込みを待機します');
        checkMetsDataLoaded();
    }
});