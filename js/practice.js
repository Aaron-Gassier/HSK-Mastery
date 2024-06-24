/*
 * Chinese Study Helper License
 * Copyright (c) 2024 Aaron GASSIER
 * 
 * Permission is hereby granted to view this file, subject to the following conditions:
 * 
 * 1. The file must not be modified or altered in any way without the express written permission of the copyright holder.
 * 2. The file must not be distributed, sublicensed, or sold without the express written permission of the copyright holder.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT.
 */

document.addEventListener('DOMContentLoaded', () => {
    const allHSKLevels = ['hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5', 'hsk6'];
    let allWords = [];
    let wordMap = new Map();
    let currentWord = null;

    // Load data and organize it into a map
    allHSKLevels.forEach(level => {
        let data = JSON.parse(localStorage.getItem(level)) || [];
        allWords = allWords.concat(data);
        data.forEach(word => {
            if (!wordMap.has(level)) {
                wordMap.set(level, []);
            }
            wordMap.get(level).push(word);
        });
    });

    const questionElement = document.getElementById('question');
    const detailsElement = document.getElementById('details');
    const optionsElement = document.getElementById('options');
    const nextQuestionButton = document.getElementById('nextQuestionButton');

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function applyFilters() {
        const selectedHSKLevels = Array.from(document.querySelectorAll('.filter-container .filter-section:nth-child(1) input:checked')).map(checkbox => `hsk${checkbox.value}`);
        const selectedMasteryLevels = Array.from(document.querySelectorAll('.filter-container .filter-section:nth-child(2) input:checked')).map(checkbox => parseInt(checkbox.value));

        let filteredWords = allWords;

        if (selectedHSKLevels.length > 0) {
            filteredWords = filteredWords.filter(word => selectedHSKLevels.includes(`hsk${word.HSK}`));
        }

        if (selectedMasteryLevels.length > 0) {
            filteredWords = filteredWords.filter(word => selectedMasteryLevels.includes(word.Mastery));
        }

        return filteredWords;
    }

    function generateQuestion() {
        const filteredWords = applyFilters();
        console.log('Filtered Words:', filteredWords);

        if (filteredWords.length === 0) {
            questionElement.textContent = "No words match the selected filters.";
            detailsElement.innerHTML = "";
            optionsElement.innerHTML = "";
            nextQuestionButton.textContent = "Generate a New Question";
            nextQuestionButton.onclick = generateQuestion;
            return;
        }

        currentWord = filteredWords[getRandomInt(filteredWords.length)];
        const options = [currentWord];

        while (options.length < 6) {
            const randomWord = filteredWords[getRandomInt(filteredWords.length)];
            if (!options.includes(randomWord)) {
                options.push(randomWord);
            }
            if (filteredWords.length < 6 && options.length < 6) {
                options.push(...filteredWords.slice(0, 6 - options.length));
            }
        }

        options.sort(() => Math.random() - 0.5);

        questionElement.textContent = `What is the pronunciation and meaning of: ${currentWord.Word}?`;
        detailsElement.innerHTML = `HSK: ${currentWord.HSK} | Mastery: ${currentWord.Mastery}`;

        optionsElement.innerHTML = '';
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <button onclick="checkAnswer('${currentWord.Word}', '${option.Word}', this)">
                    ${option.Pronunciation} - ${option.Definition}
                </button>
            `;
            optionsElement.appendChild(optionElement);
        });

        nextQuestionButton.textContent = "Generate a New Question";
        nextQuestionButton.onclick = generateQuestion;
    }

    window.updateFilters = function() {
        console.log('Filters updated');
        generateQuestion();
    }

    window.checkAnswer = function(correctWord, selectedWord, buttonElement) {
        const optionButtons = document.querySelectorAll('.option button');
        optionButtons.forEach(button => button.disabled = true);

        let correctButton;
        if (correctWord === selectedWord) {
            buttonElement.style.backgroundColor = 'green';
        } else {
            buttonElement.style.backgroundColor = 'red';
            correctButton = Array.from(optionButtons).find(button => button.innerHTML.includes(currentWord.Pronunciation));
            correctButton.style.backgroundColor = 'green';
        }

        nextQuestionButton.textContent = "Next Question";
        nextQuestionButton.onclick = generateQuestion;
    };

    window.updateWordMastery = function() {
        const newMastery = parseInt(document.getElementById('newMastery').value);
        if (currentWord) {
            const wordObj = allWords.find(item => item.Word === currentWord.Word);
            wordObj.Mastery = newMastery;

            const level = `hsk${wordObj.HSK}`;
            const levelData = JSON.parse(localStorage.getItem(level)) || [];
            const wordIndex = levelData.findIndex(item => item.Word === currentWord.Word);
            if (wordIndex > -1) {
                levelData[wordIndex].Mastery = newMastery;
                localStorage.setItem(level, JSON.stringify(levelData));
            }

            detailsElement.innerHTML = `HSK: ${currentWord.HSK} | Mastery: ${newMastery}`;
        }
    };

    generateQuestion();
});
