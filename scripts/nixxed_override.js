//var request = new XMLHttpRequest();
//request.open('GET', 'http://chatty.nixxed.com/index.html', false);  // `false` makes the request synchronous
//request.send(null);
//
//if (request.status === 200) {

//Since we're running at the creation of the DOM, we have to build things up from scratch.
// I don't know if this is causing there to be two heads or not, but stuff appears to work fine that way so we're just going to roll with it for now.
    var head = document.createElement('head');
    var cssNode = document.createElement('link');
    cssNode.type = 'text/css';
    cssNode.rel = 'stylesheet';
    cssNode.href = 'http://chatty.nixxed.com/bundle.css';
    cssNode.media = 'screen';
    head.appendChild(cssNode);

    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.src = "http://chatty.nixxed.com/bundle.js";
    head.appendChild(s);

    var s1 = document.createElement('script');
    s1.setAttribute('type', 'text/javascript');
    s1.src = "http://chatty.nixxed.com/templates.js";
    head.appendChild(s1);

    document.documentElement.appendChild(head);

    var nixxedOverride = document.createElement('div');

    nixxedOverride.innerHTML = "<div ng-app='chatty' ng-controller='chattyCtrl' ng-cloak class='ng-cloak'> <navbar></navbar>  <div class='threads' hotkeys>    <div class='rootPost collapsed' ng-show='newThreads.length'>    <a href='' title='Show New Threads' class='showpost' ng-click='expandNewThreads()'>{{newThreads.length}} New Threads Available. Click to show.</a></div><div ng-repeat='post in threads track by post.id' ng-hide='filterSet && !post.visible'><div ng-if='post.state !== &#39;collapsed&#39;' class='rootPost' ng-class='post.tagClass'><post></post><div class='postBody postBodyText' ng-bind-html='::post.body | trusted'></div><a href='' title='Collapse/Close' class='closepost' ng-click='collapseThread(post)'>x</a></div><div ng-if='post.state === &#39;collapsed&#39;' class='rootPost collapsed' ng-class='post.tagClass'><post></post><div class='postBody' ng-bind-html='::post.oneline | trusted'></div><a href='' title='Show Full Post' class='showpost' ng-click='expandThread(post)'>Show Full Post</a></div><div ng-if='!post.state'><replybox class='replybox-op' post='post' ng-if='post.replying'></replybox><div class='treeview'><comments posts='post.posts'></comments></div></div><div ng-if='post.state === &#39;truncated&#39;' class='truncated'><div class='threadContainer'><p class='threadCapHeader'><a href='' ng-click='expandThread(post)'>&nbsp;Thread Truncated. Click to see all <strong>{{post.replyCount}}</strong> replies.</a></p><div class='treeview'><comments posts='post.posts'></comments></div></div></div></div></div></div>";

    document.documentElement.appendChild(nixxedOverride);

var observer = new MutationObserver(function(mutations) {
    var found = false;
    //Apparently the for foo in bar syntax is significantly faster in chrome than array indexing.
    //http://jsperf.com/performance-of-array-vs-object/3
    for(var mutationIndex in mutations) {
        var mutation = mutations[mutationIndex];
        //Mozilla documentation says this won't work for NodeList ... seems to work in Chrome though, so... yay?
        for(var nodeIndex in mutation.addedNodes) {
            var node = mutation.addedNodes[nodeIndex];
            if(node.id === "chatty_comments_wrap") {
                var parent = node.parentNode;
                //Kill the node immediately
                parent.removeChild(node);
                console.log("Removing chatty_comments_wrap");
                //Replace it with our stuff.
                parent.appendChild(nixxedOverride);
                found = true;
                break; //We're done with our job here, get the hell out
            }
        }
        if(found) { break; }
    }
    if(found) {
        //If we're done, stop watching.
        observer.disconnect();
    }
});

observer.observe(document.documentElement, {childList: true, subtree: true});
//}