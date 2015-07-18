var editor = ace.edit("editor");

	editor.setTheme("ace/theme/monokai");
	editor.getSession().setMode("ace/mode/ruby");

	editor.getSession().on('change', function(e) {
	 console.log('hi');
	});