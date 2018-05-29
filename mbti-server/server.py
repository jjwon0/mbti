from flask import (
    Flask,
    request,
    jsonify,
    render_template,
)
from flask_cors import CORS

from ml import (
    classify_bucket,
    classify_building,
    featurize_mbti_type,
)


app = Flask(__name__)
CORS(app)


_CLASSIFIER_TO_CLASSIFY_FN = {
    'bucket': classify_bucket,
    'building': classify_building,
}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/classify/<classifier>', methods=['POST'])
def classify(classifier):
    """Classifies a person based on their MBTI.

    Args:
        classifier: Either "bucket" or "building"
    """

    request_json = request.get_json()
    classify_fn = _CLASSIFIER_TO_CLASSIFY_FN[classifier]
    classification = classify_fn(request_json['mbti'])[0]

    return jsonify({
        'mbti': classification,
    })
