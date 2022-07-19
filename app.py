from crypt import methods
from boggle import Boggle
from flask import Flask, request, render_template, jsonify, session
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
app.config['SECRET_KEY'] = "never-tell!"
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

debug = DebugToolbarExtension(app)

boggle_game = Boggle()

@app.route("/")
def homepage():
    """Generate Boggle board"""
    board = boggle_game.make_board()
    session['board'] = board

    return render_template("base.html", board=board)

@app.route("/check-word")
def check_word():
    """Check if word is in dictionary"""    

    word = request.args["word"]
    #coming from the input form right?
    board = session["board"]
    # Why do we have to declare this again? I know the "board" in homepage function is
    #local but if that's the case why don't we have to initialize it with
    #boggle_game.make_board()? How is it being used here?
    response = boggle_game.check_valid_word(board, word)

    return jsonify({'result' : response})
    #need to respond with JSON using jsonify since I made an AJAX request to the server

@app.route("/post-score", methods=["POST"])
def post_score():
    """Receive score, update nplays, update high score if appropriate"""    

    score = request.json["score"]
    highscore = session.get("highscore", 0)
    nplays = session.get("nplays", 0)

    session['nplays'] = nplays + 1
    session['highscore'] = max(score, highscore)

    return jsonify(brokeRecord=score > highscore)