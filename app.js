var Issue = Backbone.Model.extend({
    urlRoot: "http://kule-demo.fatiherikli.com/issues",
    idAttribute: "_id",
    defaults: {
        is_completed: false
    }
});

var Issues = Backbone.Collection.extend({
    url: "http://kule-demo.fatiherikli.com/issues",
    model: Issue,
    parse: function(data) {
        return data['objects'];
    }
});

var CreateIssueView = Backbone.View.extend({
    el: '#new-issue',
    events: {
        'submit': 'submit'
    },
    submit: function () {
        this.model.create({
            'title': this.$el.find('#title').val(),
            'description': this.$el.find('#description').val()
        });

        this.$el.find('#title, #description').val('');
        return false
    }
});

var IssueView = Backbone.View.extend({
    tagName: 'li',
    template: $('#issue_template').html(),
    events: {
        'click .remove': 'remove',
        'click .complete': 'complete',
        'click .undo': 'undo'
    },
    initialize: function () {
        this.model.on('change', this.render, this);
    },
    render: function () {
        this.$el
            .html(_.template(this.template, this.model.toJSON()))
            .attr('class', this.model.get('is_completed') ? 'completed' : '');
        return this;
    },
    remove: function () {
        this.$el.slideUp(200, function () {
            this.model.destroy();
        }.bind(this));
        return false;
    },
    complete: function () {
        this.model.save({'is_completed': true});
        return false;
    },
    undo: function () {
        this.model.save({'is_completed': false});
        return false;
    }
});

var IssueListView = Backbone.View.extend({
    el: 'article ul',
    initialize: function () {
        this.model.on('reset remove', this.render, this);
        this.model.on('add', this.addIssue, this);
    },
    addIssue: function (issue) {
        this.$el.append(new IssueView({
            model: issue
        }).render().el);
    },
    render: function () {
        this.$el.empty();
        _.forEach(this.model.models, this.addIssue, this);
        return this;
    }
});

var IssueTrackerView = Backbone.View.extend({
    el: 'body',
    render: function () {
        var issues = new Issues();
        new CreateIssueView({
            model: issues
        }).render();
        new IssueListView({
            model: issues
        }).render();
        issues.fetch();
    }
});