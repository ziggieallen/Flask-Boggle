class BoggleGame {
    /* make a new game at this DOM id */

    constructor(boardId, secs = 60) {
        this.secs = secs; // game length
        this.showTimer();
        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardId);
        // Not sure how the above works. Is this setting the board ID? 
        // If that's the case why wouldnt I just manually give the table that contains
        // the board an ID in the html file

        // every 1000 msec. "tick"
        this.timer = setInterval(this.tick.bind(this), 1000);

        $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
        // I think this assigns an event listener but I have no clue how it does that
        // "this" has always confused me
    }
    
    //  show word in list of words

    showWord(word) {

        $(".words", this.board).append($("<li>", { text: word }));
        // is .word coming from the name of my input being word?
        // how is it working with this.board?
        // is it just adding a user's word to the DOM?
    }

    showScore() {
        $(".score", this.board).text(this.score);
        // What is the purpose of using .text over .append here?
        // Is it because we have score at 0 in the html file and .text replaces that 0
        // rather than adds to it?
    }

    // show a status message

    showMessage(msg, cls) {
        $(".msg", this.board)
        .text(msg)
        .removeClass()
        .addClass(`msg ${cls}`);
    }

    // handle submission of word: if unique and valid, score and show

    async handleSubmit(evt) {
        evt.preventDefault();
        const $word = $(".word", this.board);

        let word = $word.val();
        if (!word) return;
        // What does this do

        if (this.words.has(word)) {
            this.showMessage(`Already found $(word)`, "err");
        }

        // check server for validity
        const resp = await axios.get("/check-word", { params: { word: word }});
        // How does params work?
        if (resp.data.result === "not-word") {
            this.showMessage(`${word} is not a valid English word`, "err");
        } else if (resp.data.result === "not-on-board") {
            this.showMessage(`${word} is not a valid word on this board`, "err");
        } else {
            this.showWord(word);
            this.score += word.length;
            this.showScore();
            this.words.add(word);
            this.showMessage(`Added: ${word}`, "ok");
        }

        $word.val("").focus();
        // ?
    }

    /* Update timer in DOM */
    // Any reason why this goes below the async function?

    showTimer() {
        $(".timer", this.board).text(this.secs);
    }

    /* Tick: handle a second passing in game */

    async tick() {
        this.secs -= 1;
        this.showTimer();

        if (this.secs === 0) {
            clearInterval(this.timer);
            await this.scoreGame();
        }
    }

    /* end of game: score and update message */

    async scoreGame() {
        $(".add-word", this.board).hide();
        const resp = await axios.post("/post-score", { score: this.score });
        if (resp.data.brokeRecord) {
            this.showMessage(`New Record: ${this.score}`, "ok");
        } else {
            this.showMessage(`Final Score: ${this.score}`, "ok");
        }
    }
  
}


// for some reason putting this in the base.html file (which is how it is in the solution)
// did not work
