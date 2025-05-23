// ==UserScript==
// @name         Sillypost Exchange + UI Enhance
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Makes exchange messages clearer + renames all currency + enhances UI
// @author       CellIJel
// @match        https://sillypost.net/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const SILLY_D_IMAGE = 'https://github.com/CellIJel/customization/blob/main/sillypost/exchange/sillyD.png?raw=true';
    const SILLY_P_IMAGE = 'https://github.com/CellIJel/customization/blob/main/sillypost/exchange/sillyP.png?raw=true';
    const SILLY_C_IMAGE = 'https://github.com/CellIJel/customization/blob/main/sillypost/exchange/sillyC.png?raw=true';

    // Cache DOM selectors and status messages
    const STATUS_MESSAGES = {
        'swag!!!! b)': {
            text: 'SELL',
            color: '#ff4444'
        },
        "we're so back!!! :d": {
            text: 'Consider Selling',
            color: '#ffaa00'
        },
        'mid :/': {
            text: 'Consider Holding',
            color: '#888888'
        },
        'in shambles!': {
            text: 'Consider Buying',
            color: '#44bb44'
        },
        'its so over d:': {
            text: 'BUY',
            color: '#00ff00'
        }
    };

    // Debounce function
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // Update all currency and UI elements in posts
    const updatePostsFeed = () => {
        // Update post feed currency and buttons
        const posts = document.querySelectorAll('.post');
        posts.forEach(post => {
            if (!post.dataset.modified) {
                // Update beans to dollars
                const beanSpans = post.querySelectorAll('.post-author-beans');
                beanSpans.forEach(span => {
                    const beanImg = span.querySelector('img');
                    if (beanImg) {
                        beanImg.src = SILLY_D_IMAGE;
                        beanImg.alt = 'dollars';
                    }
                    span.innerHTML = span.innerHTML.replace(/beans/g, 'dollars');
                });

                // Update ipods to plaques
                const ipodSpans = post.querySelectorAll('.post-author-ipods');
                ipodSpans.forEach(span => {
                    const ipodImg = span.querySelector('img');
                    if (ipodImg) {
                        ipodImg.src = SILLY_P_IMAGE;
                        ipodImg.alt = 'plaques';
                    }
                    span.innerHTML = span.innerHTML.replace(/ipods/g, 'plaques');
                });

                // Update :3 buttons to up arrows
                const colonThreeButtons = post.querySelectorAll('.ctform button');
                colonThreeButtons.forEach(button => {
                    if (button.textContent === ':3') {
                        button.innerHTML = 'Like';
                        button.style.fontFamily = 'sans-serif';
                        button.style.fontSize = '14px';
                    }
                });

                post.dataset.modified = 'true';
            }
        });
    };

    // Update sillymarket area on home page
    const updateSillyMarketArea = () => {
        const marketArea = document.querySelector('#sillymarket-area');
        if (marketArea && !marketArea.dataset.modified) {
            // Replace bean images
            const beanImages = marketArea.querySelectorAll('img[src*="bean.png"]');
            beanImages.forEach(img => {
                img.src = SILLY_D_IMAGE;
                img.alt = 'dollars';
            });

            // Replace text content
            const textNodes = [];
            const walker = document.createTreeWalker(
                marketArea,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let node;
            while (node = walker.nextNode()) {
                if (node.nodeValue.includes('beans')) {
                    textNodes.push(node);
                }
            }

            textNodes.forEach(textNode => {
                textNode.nodeValue = textNode.nodeValue.replace(/beans/g, 'dollars');
            });

            marketArea.dataset.modified = 'true';
        }
    };

    // Update trade section
    const updateTradeSection = () => {
        const tradeSection = document.querySelector('#trade');
        if (tradeSection && !tradeSection.dataset.modified) {
            const tradePriceText = tradeSection.querySelector('p');
            if (tradePriceText) {
                const beanImage = tradePriceText.querySelector('img');
                if (beanImage) {
                    beanImage.src = SILLY_D_IMAGE;
                    beanImage.alt = 'dollars';
                }
                tradePriceText.innerHTML = tradePriceText.innerHTML.replace(/beans/g, 'dollars');
            }
            tradeSection.dataset.modified = 'true';
        }
    };

    // Exchange message modifier
    const modifyExchangeMessage = () => {
        const statusElement = document.getElementById('sillymarket-status');
        if (!statusElement || statusElement.dataset.modified) return;

        const currentText = statusElement.innerText.toLowerCase();
        const newStatus = STATUS_MESSAGES[currentText];

        if (newStatus) {
            statusElement.innerText = newStatus.text;
            statusElement.style.color = newStatus.color;
            statusElement.style.fontWeight = 'bold';
            statusElement.dataset.modified = 'true';
        }
    };

    // Header currency update
    const updateHeaderCurrency = () => {
        const currencies = [
            { id: '#header-beans', image: SILLY_D_IMAGE, oldName: 'beans', newName: 'dollars' },
            { id: '#header-ipods', image: SILLY_P_IMAGE, oldName: 'ipods', newName: 'plaques' },
            { id: '#header-quarters', image: SILLY_C_IMAGE, oldName: 'quarters', newName: 'quarters' }
        ];

        currencies.forEach(currency => {
            const element = document.querySelector(currency.id);
            if (element && !element.dataset.modified) {
                const number = element.textContent.match(/\d+/)?.[0] || '';
                element.innerHTML = `<img src="${currency.image}" alt="${currency.newName}"> ${number} ${currency.newName}`;
                element.dataset.modified = 'true';
            }
        });
    };

    // Observer setup for dynamic content
    const setupObservers = () => {
        const observer = new MutationObserver(debounce(() => {
            updateHeaderCurrency();
            updatePostsFeed();
            updateSillyMarketArea();
            updateTradeSection();
            modifyExchangeMessage();
        }, 250));

        // Observe the main content area
        const mainContent = document.querySelector('#main');
        if (mainContent) {
            observer.observe(mainContent, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    };

    // Initialize everything
    const init = () => {
        updateHeaderCurrency();
        updatePostsFeed();
        updateSillyMarketArea();
        updateTradeSection();
        modifyExchangeMessage();
        setupObservers();
    };

    // Wait for document to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
