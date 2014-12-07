ChromeShack =
{
    observers: [],

    install: function()
    {
        // start listening for new nodes (replies) being inserted
        document.addEventListener('DOMNodeInserted', function(e)
        {

            var source_id = e.srcElement.id;
            var observer;

            // starts with "root", they probably refreshed the thread
            if (source_id && source_id.indexOf("root_") == 0)
            {
                //We're running on nixxed stuff, so we need to watch for the DOM to be manipulated and get a post ID.
                if(isRunningAtNixxed())
                {
                    observer = new MutationObserver(ChromeShack.rootMutation);
                    observer.observe(e.target, {attributes: true});
                    ChromeShack.observers.push({id: source_id.substr(5), observer: observer});
                } else {
                    ChromeShack.processFullPosts(e.srcElement);
                }
            }
            else if (source_id == "postbox")
            {
                ChromeShack.processPostBox(e.srcElement);
            }

            // starts with "item_", they probably clicked on a reply
            if (!isRunningAtNixxed() && e.relatedNode.id.indexOf("item_") == 0)
            {
                // grab the id from the old node, since the new node doesn't contain the id
                var id = e.relatedNode.id.substr(5);
                ChromeShack.processPost(e.relatedNode, id);
            }

            if(isRunningAtNixxed()) {
                var replyPosts = $(e.relatedNode).find('.replyPost')
                if(replyPosts.length > 0) {
                    var lis = replyPosts.parents("li[id^='item_']");
                    if(lis.length > 0) {
                        var li = lis[0];
                        observer = new MutationObserver(ChromeShack.replyMutation);
                        observer.observe(li, {subtree: true, childList: true});
                        ChromeShack.observers.push({id: li.id.substr(5), observer:observer});
                    }
                }
            }
        }, true);
    },

    findAndRemoveObserverForId: function(id) {
        var location = -1;
        for(var i = 0; i < ChromeShack.observers.length; i++) {
            if (ChromeShack.observers[i].id === id) {
                location = i;
                break;
            }
        }
        if(location > -1) {
            return ChromeShack.observers.splice(location, 1)[0];
        }
    },

    rootMutation: function(mutations) {
        mutations.forEach(function (mutation) {
            ChromeShack.findAndRemoveObserverForId(mutation.target.id.substr(5)).disconnect();
            ChromeShack.processFullPosts(mutation.target);
        });
    },

    replyMutation: function(mutations) {
        mutations.forEach(function (mutation) {
            console.log('mutation on replyPost');
            //Find the parent root post with the ID.
            var jqMutation = $(mutation.target);
            if (jqMutation.hasClass('postBody')) {
                var rootPost = jqMutation.parents("div[id^='root_']");
                var thisPost = jqMutation.parents("li[id^='item_']")[0]; //It'll be the nearest.
                if (rootPost.length > 0) {
                    var id = thisPost.id.substr(5);
                    ChromeShack.findAndRemoveObserverForId(id).disconnect();
                    ChromeShack.processPost(thisPost, id);
                }
            }
        });
    },

    processFullPosts: function(element)
    {
        // process fullposts
        var items = document.evaluate(".//div[contains(@class, 'fullpost') or contains(@class, 'rootPost')]/..", element, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        for (item = null, i = 0; item = items.snapshotItem(i); i++)
        {
            ChromeShack.processPost(item, item.id.substr(5));
        }
        fullPostsCompletedEvent.raise();   
    },

    processPost: function(item, root_id)
    {
        var ul = item.parentNode;
        var div = ul.parentNode;
        var is_root_post = (div.className.indexOf("root") >= 0) || (div.id.indexOf("root_") === 0);
        processPostEvent.raise(item, root_id, is_root_post);
    },

    processPostBox: function(postbox)
    {
        processPostBoxEvent.raise(postbox);
    }

}

settingsLoadedEvent.addHandler(function() {
    ChromeShack.install();
    ChromeShack.processFullPosts(document);
});
