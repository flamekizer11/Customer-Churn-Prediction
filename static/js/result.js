// Result page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Read prediction data from hidden div and set window.predictionData
    const dataDiv = document.getElementById('prediction-data');
    window.predictionData = {
        error: dataDiv.dataset.error === 'true',
        noChurnProb: parseFloat(dataDiv.dataset.noChurn),
        churnProb: parseFloat(dataDiv.dataset.churn),
        prediction: dataDiv.dataset.prediction
    };

    // Check if we have prediction data
    if (window.predictionData && !window.predictionData.error) {
        initializeChart();
        animateProgressBars();
        addResultInteractions();
    }
    
    // Initialize the donut chart
    function initializeChart() {
        const ctx = document.getElementById('probabilityChart');
        if (!ctx) return;
        
        const chart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['No Churn', 'Churn'],
                datasets: [{
                    data: [window.predictionData.noChurnProb, window.predictionData.churnProb],
                    backgroundColor: [
                        '#51cf66',
                        '#ff6b6b'
                    ],
                    borderWidth: 4,
                    borderColor: '#fff',
                    hoverBorderWidth: 6,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 25,
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed.toFixed(1) + '%';
                            }
                        },
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#667eea',
                        borderWidth: 2,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 2000,
                    easing: 'easeInOutQuart'
                },
                cutout: '60%'
            }
        });
        
        // Add click interaction
        ctx.onclick = function(evt) {
            const points = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
            if (points.length) {
                const firstPoint = points[0];
                const label = chart.data.labels[firstPoint.index];
                const value = chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
                
                showDetailModal(label, value);
            }
        };
    }
    
    // Animate progress bars
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('progress');
        
        progressBars.forEach(bar => {
            const targetValue = bar.getAttribute('value');
            bar.setAttribute('value', '0');
            
            setTimeout(() => {
                animateValue(bar, 0, parseFloat(targetValue), 2000);
            }, 500);
        });
    }
    
    // Animate value function
    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = progress * (end - start) + start;
            element.setAttribute('value', currentValue);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    // Add interactive features
    function addResultInteractions() {
        // Add hover effects to customer info cards
        const infoCards = document.querySelectorAll('.customer-info');
        infoCards.forEach(card => {
            card.style.transition = 'all 0.3s ease';
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(10px) scale(1.02)';
                this.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.2)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(0) scale(1)';
                this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            });
        });
        
        // Add pulse animation to prediction result
        const predictionResult = document.querySelector('.prediction-result');
        if (predictionResult) {
            predictionResult.style.transition = 'transform 0.2s ease';
            setInterval(() => pulsePredictionResult(predictionResult), 3000);
        }
        
        // Add copy functionality for results
        addCopyFunctionality();
        
        // Add share functionality
        addShareFunctionality();
        
        // Add export functionality
        addExportFunctionality();
    }
    
    // Show detail modal
    function showDetailModal(label, value) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'detailModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">📊 ${label} Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="display-4 mb-3 ${label === 'Churn' ? 'text-danger' : 'text-success'}">
                            ${value.toFixed(1)}%
                        </div>
                        <p class="lead">
                            ${label === 'Churn' ? 
                                'This indicates the likelihood that the customer will discontinue their service.' : 
                                'This indicates the likelihood that the customer will continue using the service.'
                            }
                        </p>
                        <div class="alert ${label === 'Churn' ? 'alert-danger' : 'alert-success'}">
                            ${label === 'Churn' ? 
                                'Consider reaching out to the customer to understand their concerns and offer incentives.' :
                                'Keep up the good work maintaining customer satisfaction!'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Remove modal after it's hidden
        modal.addEventListener('hidden.bs.modal', function() {
            modal.remove();
        });
    }
    
    // Add copy functionality
    function addCopyFunctionality() {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn btn-outline-secondary btn-sm';
        copyBtn.innerHTML = '📋 Copy Results';
        copyBtn.onclick = function() {
            const resultText = generateResultText();
            navigator.clipboard.writeText(resultText).then(() => {
                copyBtn.innerHTML = '✅ Copied!';
                setTimeout(resetCopyButton, 2000);
            });
        };
        
        const buttonContainer = document.querySelector('.text-center.mt-4');
        if (buttonContainer) {
            buttonContainer.appendChild(copyBtn);
        }
    }
    
    // Add share functionality
    function addShareFunctionality() {
        const shareBtn = document.createElement('button');
        shareBtn.className = 'btn btn-outline-info btn-sm ms-2';
        shareBtn.innerHTML = '📤 Share';
        shareBtn.onclick = function() {
            if (navigator.share) {
                navigator.share({
                    title: 'Customer Churn Prediction Result',
                    text: generateResultText(),
                    url: window.location.href
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                const resultText = generateResultText();
                const shareModal = document.createElement('div');
                shareModal.className = 'modal fade';
                shareModal.innerHTML = `
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Share Results</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <textarea class="form-control" rows="8" readonly>${resultText}</textarea>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(shareModal);
                const bsModal = new bootstrap.Modal(shareModal);
                bsModal.show();
                shareModal.addEventListener('hidden.bs.modal', function() {
                    shareModal.remove();
                });
            }
        };
        
        const buttonContainer = document.querySelector('.text-center.mt-4');
        if (buttonContainer) {
            buttonContainer.appendChild(shareBtn);
        }
    }
    
    // Add export functionality
    function addExportFunctionality() {
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-outline-success btn-sm ms-2';
        exportBtn.innerHTML = '💾 Export';
        exportBtn.onclick = function() {
            const resultData = {
                prediction: window.predictionData.prediction,
                probability: window.predictionData.probability,
                timestamp: new Date().toISOString(),
                customerData: window.customerData
            };
            
            const dataStr = JSON.stringify(resultData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `churn_prediction_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        };
        
        const buttonContainer = document.querySelector('.text-center.mt-4');
        if (buttonContainer) {
            buttonContainer.appendChild(exportBtn);
        }
    }
    
    // Generate result text for sharing/copying
    function generateResultText() {
        const prediction = window.predictionData.prediction;
        const noChurnProb = window.predictionData.noChurnProb || window.predictionData.probability?.no_churn || 0;
        const churnProb = window.predictionData.churnProb || window.predictionData.probability?.churn || 0;
        
        return `Customer Churn Prediction Result
========================================
Prediction: ${prediction}
No Churn Probability: ${noChurnProb.toFixed(1)}%
Churn Probability: ${churnProb.toFixed(1)}%
Generated: ${new Date().toLocaleString()}`;
    }
    
    // Add smooth entrance animations
    function addEntranceAnimations() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }
    
    // Initialize entrance animations
    setTimeout(addEntranceAnimations, 100);
});
