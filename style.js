function createChatBox() {
      var privDiv = document.getElementById(PrivateTab);
      var privBox = document.createElement('div');
      $(privBox).attr({
          'id': target,
          'style': 'float: right; width: 220px; height: 200px; overflow-x: auto; border-radius: 6px; border: 1px #BBB solid;'
        });
      PrivateTab.appendChild(privBox);
}