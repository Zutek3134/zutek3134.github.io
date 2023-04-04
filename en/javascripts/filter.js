window.onload = function () {
  // Get all tag buttons
  const tagButtons = document.querySelectorAll('.filterButton');
  
  // Get all cards
  const cards = document.querySelectorAll('.column');

  // Attach click event listener to each tag button
  tagButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      // Get the tag name from the data-tag attribute
      const tagName = this.getAttribute('data-tag');

      // Remove the active class from all tag buttons
      tagButtons.forEach(function (button) {
        button.classList.remove('active');
      });

      // Add the active class to the clicked tag button
      this.classList.add('active');

      // Hide all cards
      cards.forEach(function (card) {
        card.style.display = 'none';
      });

      // Show only the cards with matching tag
      const matchingCards = document.querySelectorAll(`[data-tags*="${tagName}"]`);
      matchingCards.forEach(function (card) {
        card.style.display = 'block';
      });
    });
  });

  // Get the button to show all cards
  const showAllButton = document.querySelector('#show-all');

  // Attach click event listener to show all button
  showAllButton.addEventListener('click', function () {
    // Remove the active class from all tag buttons
    tagButtons.forEach(function (button) {
      button.classList.remove('active');
    });

    // Add the active class to the show all button
    this.classList.add('active');

    // Show all cards
    cards.forEach(function (card) {
      card.style.display = 'block';
    });
  });
};
