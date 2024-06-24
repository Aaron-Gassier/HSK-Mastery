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
    // Determine the HSK level from the URL query parameter
    const params = new URLSearchParams(window.location.search);
    const hskLevel = params.get('hskLevel') || 'hsk1'; // Default to 'hsk1' if not specified
    const hskTitle = `HSK ${hskLevel.slice(-1)} Words`;
    document.getElementById('hskTitle').textContent = hskTitle;
    document.getElementById('hskHeader').textContent = hskTitle;

    let data = JSON.parse(localStorage.getItem(hskLevel)) || [];

    const wordGrid = document.getElementById('wordGrid');
    displayWords(data, wordGrid);

    document.querySelectorAll('.checkboxes input').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            filterWords(data, wordGrid);
        });
    });

    document.getElementById('sortOrder').addEventListener('change', () => {
        sortWords(data, wordGrid);
    });
});

function displayWords(data, wordGrid) {
    wordGrid.innerHTML = '';
    data.forEach((word) => {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.innerHTML = `
            <span class="word">${word.Word}</span>
            <div class="mastery-controls">
                <button onclick="adjustMastery('${word.Word}', -1)">&#9664;</button>
                <span id="mastery-${word.Word}">${word.Mastery}</span>
                <button onclick="adjustMastery('${word.Word}', 1)">&#9654;</button>
            </div>
            <span class="tooltip">
                <strong>${word.Word}</strong> (${word.Pronunciation}): ${word.Definition}
                <br>Mastery Level: <span id="tooltip-mastery-${word.Word}">${word.Mastery}</span>
            </span>
        `;
        wordGrid.appendChild(gridItem);
    });
}

function adjustMastery(word, change) {
    const params = new URLSearchParams(window.location.search);
    const hskLevel = params.get('hskLevel') || 'hsk1';
    let data = JSON.parse(localStorage.getItem(hskLevel)) || [];
    const wordObj = data.find(item => item.Word === word);
    let newMastery = wordObj.Mastery + change;
    if (newMastery >= 0 && newMastery <= 5) {
        wordObj.Mastery = newMastery;
        localStorage.setItem(hskLevel, JSON.stringify(data));
        document.getElementById(`mastery-${word}`).textContent = newMastery;
        document.getElementById(`tooltip-mastery-${word}`).textContent = newMastery;
        filterWords(data, document.getElementById('wordGrid'));
    }
}

function filterWords(data, wordGrid) {
    const selectedMasteryLevels = Array.from(document.querySelectorAll('.checkboxes input:checked'))
        .map(checkbox => parseInt(checkbox.value));

    const filteredData = selectedMasteryLevels.length > 0 
        ? data.filter(word => selectedMasteryLevels.includes(word.Mastery))
        : data;

    sortWords(filteredData, wordGrid);
}

function sortWords(data, wordGrid) {
    const sortOrder = document.getElementById('sortOrder').value;

    const sortedData = [...data].sort((a, b) => {
        switch (sortOrder) {
            case 'pronunciationAsc':
                return a.Pronunciation.localeCompare(b.Pronunciation);
            case 'pronunciationDesc':
                return b.Pronunciation.localeCompare(a.Pronunciation);
            case 'masteryAsc':
                return a.Mastery - b.Mastery;
            case 'masteryDesc':
                return b.Mastery - a.Mastery;
            default:
                return 0;
        }
    });

    displayWords(sortedData, wordGrid);
}