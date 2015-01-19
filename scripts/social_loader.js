settingsLoadedEvent.addHandler(function()
{
    if (getSetting("enabled_scripts").contains("social_loader"))
    {
        SocialLoader =
        {
            SOCIAL_TYPE_NONE: 0,
            SOCIAL_TYPE_TWITTER: 1,

            loadSocial: function(item, id)
            {
                var postbody = getDescendentByTagAndClassName(item, "div", "postbody");
                var links = postbody.getElementsByTagName("a");

                for (var i = 0; i < links.length; i++)
                {
                    var type = SocialLoader.getSocialType(links[i].href);
                    if (type != SocialLoader.SOCIAL_TYPE_NONE)
                    {
                        links[i].addEventListener("click", SocialLoader.toggleSocial, false);
                    }
                }
            },

            getSocialType: function(url)
            {
                if (url.match(/twitter\.com\/\w+\/status\/\d+.*/i))
                    return SocialLoader.SOCIAL_TYPE_TWITTER;

                return SocialLoader.SOCIAL_TYPE_NONE;
            },

            toggleSocial: function(e)
            {
                // left click only
                if (e.button == 0)
                {
                    var link = this;
                    // if there is an embed after the link, remove it
                    if (link.nextSibling != null && link.nextSibling.className == "SocialLoader")
                    {
                        link.parentNode.removeChild(link.nextSibling);
                    }
                    else
                    {
                        // no embed after the link? add one in!
                        var type = SocialLoader.getSocialType(link.href);
                        var social;

                        if (type == SocialLoader.SOCIAL_TYPE_TWITTER)
                            social = SocialLoader.createTwitter(link);

                        // we actually created an embed
                        if (social != null)
                        {
                            var div = document.createElement("div");
                            div.className = "SocialLoader";
                            div.appendChild(social);

                            // add the embed right after the link
                            link.parentNode.insertBefore(div, link.nextSibling);
                        }
                    }
                    
                    e.preventDefault();
                }
            },

            createTwitter: function(link)
            {
                $.get("http://localhost:8000/tweet?tweetUrl=" + link.href, function(data) {
                    var div = document.createElement("div");
                    div.className = "SocialLoader";
                    div.innerHTML = data;
                    div.firstChild.setAttribute('data-theme', 'dark');

                    // add the embed right after the link
                    link.parentNode.insertBefore(div, link.nextSibling);

                    var twitterWidget = document.createElement('script');
                    twitterWidget.setAttribute('async', '');
                    twitterWidget.setAttribute('src', '//platform.twitter.com/widgets.js');
                    twitterWidget.setAttribute('charset', 'utf-8');
                    document.head.appendChild(twitterWidget);
                }).fail(function() {
                    // GET failed, fall back to opening the link
                    window.open(link.href);
                });
                
                // we'll attach it to the document in the callback
                return null;
            },

            createTwitter_IFRAME: function(href)
            {
                var width = 640, height = 390;

                var i = document.createElement("iframe");
                i.setAttribute("type", "text/html");
                i.setAttribute("width", width);
                i.setAttribute("height", height);
                i.setAttribute("src", "http://localhost:8000/tweet?tweetUrl=" + href);
                i.setAttribute("frameborder", "0");

                return i;
            }
        }

        processPostEvent.addHandler(SocialLoader.loadSocial);
    }
});
