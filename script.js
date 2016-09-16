var Router = Backbone.Router.extend({
    routes: {
        'register': 'register',
        'login': 'login',
        'messages': 'messages'
    },
    register: function() {
        console.log('register');
        var registerModel = new RegisterModel();
        var registerView = new RegisterView({
            el: '#main',
            model: registerModel
        });
    },
    login: function() {

    },
    messages: function() {
        var messagesView = new MessagesView();
    }
});

var RegisterModel = Backbone.Model.extend({
    url: '/register',
    save: function() {
        return $.post(this.url, this.toJSON());
    }
});

var RegisterView = Backbone.View.extend({
    render: function() {
        var form = $('#register').html();
        console.log(this.$el);
        this.$el.html(form);
    },
    initialize: function() {
        this.render();
        this.model.set({
            first_name: $("input[name|='first']").val(),
            last_name: $("input[name|='last']").val(),
            email: $("input[name|='email']").val(),
            password: $("input[name|='password']").val()
        });
    },
    events: {
        'click #registerButton' : function(event) {
            console.log('hello');
            this.model.set({
                first_name: $("input[name|='first']").val(),
                last_name: $("input[name|='last']").val(),
                email: $("input[name|='email']").val(),
                password: $("input[name|='password']").val()
            }
        ).save().then(function() {
            console.log('saved');
            window.location.hash = 'messages';
        });
        }
    }
});

var MessagesView = Backbone.View.extend({
    render: function() {
        $('#main').empty();
    },
    initialize: function() {
        this.render();
    }
});


var router = new Router();
Backbone.history.start();
