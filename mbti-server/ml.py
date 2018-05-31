import csv
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans


MBTI_LETTERS = 'IESNFTJP'
DATA_FILENAME = 'data.csv'
DATA_DICTS = None
CLASSIFIERS = {
    'bucket': None,
    'building': None,
}


def convert_featurized_mbti_to_mbti_type(mbti_featurized):
    mbti = ''

    for i in range(0, len(MBTI_LETTERS), 2):
        if mbti_featurized[i] > mbti_featurized[i + 1]:
            mbti += MBTI_LETTERS[i]
        else:
            mbti += MBTI_LETTERS[i + 1]

    return mbti


def featurize_mbti_type(mbti):
    """Converts an MBTI type to features."""

    return [
        float(letter in mbti)
        for letter in MBTI_LETTERS
    ]


def featurize_mbti_breakdown(mbti_breakdown):
    """Converts a breakdown of MBTI attributes to classifier features.

    Args:
        mbti_breakdown: A dictionary of values, where the keys are lowercase
            MBTI letters. For example:
            {
                'i': 23,
                'e': 77,
                ...
            }
    """

    return [
        float(mbti_breakdown[letter.lower()]) / 100
        for letter in MBTI_LETTERS
    ]


def get_building_dataset(data):
    """Builds a dataset for predicting building from MBTI."""

    features = []
    labels = []

    for datum in data:
        feature = featurize_mbti_type(datum['type'])
        features.append(feature)

        label = datum['building']
        labels.append(label)

    return features, labels


def get_bucket_dataset(data):
    """Builds a dataset for predicting building from MBTI."""

    features = []
    labels = []

    for datum in data:
        feature = featurize_mbti_type(datum['type'])
        features.append(feature)

        label = datum['bucket']
        labels.append(label)

    return features, labels


def get_dataset(classifier_type):
    if classifier_type == 'bucket':
        return get_bucket_dataset
    elif classifier_type == 'building':
        return get_building_dataset

    raise ValueError('unknown dataset type')


def get_dicts_from_csv(filename):
    """Converts data from a csv into a list of dicts, where the dict keys are the csv headers and dict values are the cells in each row.

    Example CSV:
        email,password
        user@mail.com,12345

    Example output:
        [{ 'email': 'user@mail.com', 'password': '12345' }]
    """

    global DATA_DICTS

    if DATA_DICTS:
        return DATA_DICTS

    features = []

    with open(filename) as f:
        keys = None

        reader = csv.reader(f)
        for row in reader:
            if not keys:
                keys = row
                continue

            feature = {}

            for index, value in enumerate(row):
                key = keys[index]
                feature[key] = value

            features.append(feature)

    DATA_DICTS = features

    return features


def init_classifier(classifier_type):
    data = get_dicts_from_csv(DATA_FILENAME)
    cl_features, cl_labels = get_dataset(classifier_type)(data)

    classifier = LogisticRegression()
    classifier.fit(cl_features, cl_labels)

    return classifier


def classify(classifier_type, features):
    if classifier_type not in CLASSIFIERS:
        raise ValueError('`classifier_type` must be either "bucket" or "building"')

    if not CLASSIFIERS[classifier_type]:
        CLASSIFIERS[classifier_type] = init_classifier(classifier_type)

    classifier = CLASSIFIERS[classifier_type]

    return classifier.predict([features])


def classify_bucket(mbti):
    return classify('bucket', featurize_mbti_breakdown(mbti))


def classify_building(mbti):
    return classify('building', featurize_mbti_breakdown(mbti))


def get_clusters(num_clusters):
    data = get_dicts_from_csv(DATA_FILENAME)

    # We're just looking for MBTI features, labels don't matter
    features, _ = get_bucket_dataset(data)

    kmeans = KMeans(n_clusters=num_clusters)
    kmeans.fit(features)

    return [
        convert_featurized_mbti_to_mbti_type(cluster_center)
        for cluster_center in kmeans.cluster_centers_
    ]
