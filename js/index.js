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
    const hskFile = 'json/hsk.json';
    const hskData = {};

    // Function to load initial data
    function loadInitialData() {
        fetch(hskFile)
            .then(response => response.json())
            .then(dataArray => {
                dataArray.forEach(word => {
                    const hskLevel = `hsk${word.HSK}`;
                    if (!hskData[hskLevel]) {
                        hskData[hskLevel] = [];
                    }
                    hskData[hskLevel].push({ ...word, Mastery: 0 });
                });
                Object.keys(hskData).forEach(level => {
                    if (!localStorage.getItem(level)) {
                        localStorage.setItem(level, JSON.stringify(hskData[level]));
                    }
                });
                displayStatistics();
            })
            .catch(error => console.error('Error loading data:', error));
    }

    // Function to reset local data
    function resetLocalData() {
        localStorage.clear();
        Object.keys(hskData).forEach(level => {
            localStorage.setItem(level, JSON.stringify(hskData[level]));
        });
        alert('Local data has been reset.');
        displayStatistics();
    }

    // Function to export mastery data
    function exportMasteryData() {
        const allHSKLevels = Object.keys(hskData);
        const exportData = {};

        allHSKLevels.forEach(level => {
            const data = JSON.parse(localStorage.getItem(level));
            if (data) {
                exportData[level] = data.map(word => ({ Word: word.Word, Mastery: word.Mastery }));
            }
        });

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'mastery_data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Function to import mastery data
    function importMasteryData(event) {
        const file = event.target.files[0];
        if (!file) {
            alert('No file selected');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                Object.keys(importedData).forEach(level => {
                    const existingData = JSON.parse(localStorage.getItem(level)) || [];
                    const updatedData = existingData.map(word => {
                        const importedWord = importedData[level].find(w => w.Word === word.Word);
                        return importedWord ? { ...word, Mastery: importedWord.Mastery } : word;
                    });
                    localStorage.setItem(level, JSON.stringify(updatedData));
                });
                alert('Mastery data imported successfully.');
                displayStatistics();
            } catch (error) {
                alert('Error importing data. Please ensure the file is in the correct format.');
            }
        };
        reader.readAsText(file);
    }

    // Event listener for reset button
    const resetButton = document.getElementById('resetDataButton');
    resetButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all local data? This action cannot be undone.')) {
            resetLocalData();
        }
    });

    // Event listener for export button
    const exportButton = document.getElementById('exportDataButton');
    exportButton.addEventListener('click', exportMasteryData);

    // Event listener for import file input
    const importFileInput = document.getElementById('importFileInput');
    importFileInput.addEventListener('change', importMasteryData);

    // Load initial data
    loadInitialData();

    function displayStatistics() {
        const hskLevels = Object.keys(hskData);
        let totalWords = 0;
        let totalMastery = 0;
        const wordsPerHSK = Array(hskLevels.length).fill(0);
        const masteryPerHSK = Array(hskLevels.length).fill(0);

        hskLevels.forEach((level, index) => {
            const data = JSON.parse(localStorage.getItem(level));
            totalWords += data.length;
            wordsPerHSK[index] = data.length;
            data.forEach(word => {
                totalMastery += word.Mastery;
                masteryPerHSK[index] += word.Mastery;
            });
        });

        const averageMastery = (totalMastery / totalWords).toFixed(2);

        document.getElementById('totalWords').textContent = totalWords;
        document.getElementById('averageMastery').textContent = averageMastery;

        hskLevels.forEach((level, index) => {
            const averageHSKMastery = masteryPerHSK[index] / wordsPerHSK[index];
            const masteryPercentage = (averageHSKMastery * 20).toFixed(2);
            document.getElementById(`${level}Words`).textContent = wordsPerHSK[index];
            document.getElementById(`${level}Mastery`).textContent = `${masteryPercentage}%`;
        });
    }
});
