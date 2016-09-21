(function(){

    var templates = document.querySelectorAll('script[type="text/handlebars"]');

    Handlebars.templates = Handlebars.templates || {};
    console.log(Handlebars.templates);

    Array.prototype.slice.call(templates).forEach(function(script) {
        Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
    });

    var loggedInUser = JSON.parse($('#userData')[0].innerHTML);
    console.log(loggedInUser.logInStatus);
    var isLoggedIn = loggedInUser.logInStatus;

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
            var loginModel = new LoginModel();
            var loginView = new LoginView({
                el: '#main',
                model: loginModel
            });
        },
        messages: function() {
            if (isLoggedIn) {
                var messagesModel = new MessagesModel();
                var messagesView = new MessagesView({
                    el: '#main',
                    model: messagesModel
                });
            } else {
                window.location.hash = 'register';
            }
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
            this.$el.html(form);
        },
        initialize: function() {
            $('#main').empty();
            this.render();
        },
        events: {
            'click #registerButton': function(event) {
                console.log('hello');
                this.model.set({
                    first_name: $("input[name|='first']").val(),
                    last_name: $("input[name|='last']").val(),
                    email: $("input[name|='email']").val(),
                    password: $("input[name|='password']").val()
                }
            ).save().then(function(res) {
                console.log('saved');
                isLoggedIn = true;
                window.location.hash = 'messages';
            });
        },
            'click #loginLink': function(event) {
                window.location.hash = 'login';
            }
        }
    });

    var LoginModel = Backbone.Model.extend({
        url: '/login',
        save: function() {
            return $.post(this.url, this.toJSON());
        }
    });

    var LoginView = Backbone.View.extend({
        render: function() {
            var loginForm = $('#login').html();
            this.$el.html(loginForm);
        },
        initialize: function() {
            $('#main').empty();
            this.render();
        },
        events: {
            'click #loginButton': function(event) {
                console.log('hello');
                this.model.set({
                    first_name: $("input[name|='first']").val(),
                    last_name: $("input[name|='last']").val(),
                    email: $("input[name|='email']").val(),
                    password: $("input[name|='password']").val()
                }
                ).save().then(function(res) {
                    console.log('password matches');
                    window.location.hash = 'messages';

                });
                },
            'click #register': function(event) {
                window.location.hash = 'register';
            }
        }

    });

    var MessagesModel = Backbone.Model.extend({
        url: '/messages',
        save: function() {
            var model = this;
            return $.post(this.url, this.toJSON()).then(function() {
                var messages = model.get('messages');
                messages.push({ message: model.get('message')});
                console.log(messages);
            });
        },
        initialize: function() {
            this.fetch();
        }
    });

    var MessagesView = Backbone.View.extend({
        render: function() {

            var board = $('#message').html();
            this.$el.html(board);

            var messagesFromDB = this.model.get('messages');
            var renderedMessages = Handlebars.templates.allMessages(messagesFromDB);
            $('#board').html(renderedMessages);
        },
        initialize: function() {
            $('#main').empty();
            this.render();
            var view = this;
            this.model.on('change', function () {
               view.render();
           });
        },
        events: {
            'click #postMassageButton': function (event) {
                var newMessage = $('#newMessage').val();
                var view = this;
                console.log('send Message');
                this.model.set({
                    message: newMessage
                }
            ).save().then(function() {
                console.log('message saved!');
                view.render();
            });
            }
        }
    });


    var router = new Router();
    Backbone.history.start();

})();
