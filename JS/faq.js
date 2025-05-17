
document.querySelectorAll('.faq-item .question').forEach(item => {
    item.addEventListener('click', () => {
        const parent = item.closest('.faq-item');
        const isOpen = parent.classList.contains('open');
        
        document.querySelectorAll('.faq-item').forEach(faq => {
            faq.classList.remove('open');
        });
        
        if (!isOpen) {
            parent.classList.add('open');
        }
    });
});
