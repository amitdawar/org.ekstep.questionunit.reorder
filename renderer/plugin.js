/**
 *
 * Question Unit plugin to render a reordering question
 * @class org.ekstep.questionunit.reorder
 * @extends org.ekstep.contentrenderer.questionUnitPlugin
 * @author Amit Dawar <amit.dawar@funtoot.com>
 */
org.ekstep.questionunitReorder = {};
org.ekstep.questionunitReorder.RendererPlugin = org.ekstep.contentrenderer.questionUnitPlugin.extend({
  _type: 'org.ekstep.questionunit.reorder',
  _isContainer: true,
  _render: true,
  _userWords: [],
  /**
   * renderer:questionunit.reorder:showEventListener.
   * @event renderer:questionunit.reorder:show
   * @memberof org.ekstep.questionunit.reorder
   */
  setQuestionTemplate: function () {
    console.log(this._question.data.question);
    ReorderingController.initTemplate(this); // eslint-disable-line no-undef
  },
  /**
   * Listen show event
   * @memberof org.ekstep.questionunit.reorder
   * @param {Object} event from question set.
   */
  preQuestionShow: function (event) {
    this._super(event);
    this._question.template = ReorderingController.getQuestionTemplate(); // eslint-disable-line no-undef
    this._userWords = [];
  },
  /**
   * function to handle tabs(words) onclick event
   * @memberof org.ekstep.questionunit.reorder
   * @param {Object} event from question set.
   */
  onWordSelect: function (id) {
    this._userWords.push({
      id: $("#" + id).attr('id'),
      text: $("#" + id).text().trim()
    });
    $('#reorder-tarea').text(_.map(this._userWords, function (w) {
      return w.text;
    }).join(' '));
  },

  /**
   * function to handle backspace onclick event
   * @memberof org.ekstep.questionunit.reorder
   */
  onBackspaceClick: function () {
    var deleted = this._userWords.pop();
    if (deleted) {
      $('#' + deleted.id).removeClass('reorder-active reorder-remove-shadow');
      $('#reorder-tarea').text(_.map(this._userWords, function (w) {
        return w.text;
      }).join(' '));
    }
  },

  /**
   * Listen event after display the question
   * @memberof org.ekstep.questionunit.reorder
   * @param {Object} event from question set.
   */
  postQuestionShow: function (event) { // eslint-disable-line no-unused-vars
    ReorderingController.question = this._question; // eslint-disable-line no-undef
    QSTelemetryLogger.logEvent(QSTelemetryLogger.EVENT_TYPES.ASSESS); // eslint-disable-line no-undef
  },
  /**
   * renderer:questionunit.reorder:evaluateEventListener.
   * @event renderer:questionunit.reorder:evaluate
   * @param {Object} event object from questionset
   * @memberof org.ekstep.questionunit.reorder
   */
  evaluateQuestion: function (event) {
    var telemetryAnsArr = [], //array have all answer
      correctAnswer = false,
      answerArray = [],
      numOfCorrectAns = 0;

    var userText = _.map(this._userWords, function (w) {
      return w.text;
    }).join(' ');
    /*istanbul ignore else*/
    if (userText.replace(/[ ]/g, '') === this._question.data.sentence.text.trim().replace(/[ ]/g, '')) { // eslint-disable-line no-undef
      correctAnswer = true;
      numOfCorrectAns = 1;
    }

    var partialScore = 1; // (tempCount / this._question.data.answer.length) * this._question.config.max_score; // eslint-disable-line no-undef

    var result = {
      eval: correctAnswer,
      state: {
        val: answerArray
      },
      score: partialScore,
      values: telemetryAnsArr,
      noOfCorrectAns: numOfCorrectAns, //tempCount,
      totalAns: 1
    };

    var callback = event.target;
    /*istanbul ignore else*/
    if (_.isFunction(callback)) {
      callback(result);
    }

    this.saveQuestionState(result.state);

    QSTelemetryLogger.logEvent(QSTelemetryLogger.EVENT_TYPES.RESPONSE, {
      "type": "INPUT",
      "values": telemetryAnsArr
    }); // eslint-disable-line no-undef
    QSTelemetryLogger.logEvent(QSTelemetryLogger.EVENT_TYPES.ASSESSEND, result); // eslint-disable-line no-undef
  }
});
//# sourceURL=ReorderingRendererPlugin.js