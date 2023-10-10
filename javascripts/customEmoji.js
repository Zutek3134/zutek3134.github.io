  function replaceEmojisWithImages() {
    const emojiContainers = document.querySelectorAll('#customEmoji');
    if (emojiContainers) {
      emojiContainers.forEach((emojiContainer) => {
        const text = emojiContainer.innerHTML;
        const replacedText = text.replace(/:([\w+-]+):/g, '<img src="/Zutek3134/images/emojis/$1.png" alt="$1" title=":$1:" class="emoji">');
        emojiContainer.innerHTML = replacedText;
      });
    }
  }
  replaceEmojisWithImages();