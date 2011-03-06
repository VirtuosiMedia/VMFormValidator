/*
---
description: Provides validation and and error handling for forms

license: MIT-style

authors:
- Virtuosi Media

requires:
- core/1.2.4: '*'

provides: [VMFormValidator]

...
*/
var VMFormValidator = new Class({
	
	Implements: [Events, Options],

	options: {
		disableSubmit: true,					//Disable the submit button on failure, default true
		errorDisplay: 'aboveInput',				//Where the errors are displayed: 'aboveInput', 'belowInput', 'aboveForm'
		errorDisplayMultiple: false,			//Display multiple errors at a time; defaults false
		errorListClass: 'errorList',			//Class for the error display list
		errorListItemClass: 'errorListItem',	//Class for the error display list item
		errorElement: 'errorElement',			//Class for the input box when an error is detected 
		errorLabel: 'errorLabel',				//Class for the input label when an error is detected
		labelDisplay: 'before',					//Where the label is in relation to the form element in the HTML: 'before', 'after'
		successElementClass: 'successElement',	//Class for the input box when validation succeeds
		successLabelClass: 'successLabel',		//Class for the input label when validation succeeds
		validateOnBlur: true,					//Validate each form element on blur, defaults true
		validateOnSubmit: true					//Validate each form element on submit, defaults true
	},

	initialize: function(formId, options){
		this.setOptions(options);
		this.form = formId;
		this.formElements = {};
		this.errorListIds = {};
		if (this.options.validateOnSubmit == true){
			var t = this;
			$(this.form).addEvent('submit', function(e){
				t.executeAllValidators(e);
				
				if (t.options.errorDisplay == 'aboveForm'){
					var numberErrors = $(t.form+'ErrorList').getElements('li[class='+t.options.errorListItemClass+']');
				} else {
					var numberErrors = $(t.form).getElements('li[class='+t.options.errorListItemClass+']');
				}
				if (numberErrors.length != 0){ return false; }
			});
		}
		this.buildFormElementArray($(this.form), this.formElements, this);			
	},

	//Validations are stored in an array because Internet Explorer fires events in a random order
	buildFormElementArray: function(form, formElements, validator){
		var formElementsArray = form.getElements('input[type="text"], input[type="password"], input[type="checkbox"], input[type="file"], input[type="radio"], textarea, select').clean();
		formElementsArray.each(function(item){
			var elementName = item.getProperty('name');

			element = {
				elName: elementName,								   
				validators:	{}
			};
			if (validator.options.validateOnBlur == true) {
				item.addEvent('blur', function(event){
					validator.executeValidators(elementName, event, this);
				});
			}
			this.formElements[elementName] = element;
			this.errorListIds[elementName] = [];
		}, this);
	},
	
	setValidator: function(elementName, validatorName, vFunction, error){
		this.formElements[elementName]['validators'][validatorName] = {
			validatorFunction: vFunction,
			validatorError: error
		};
	},

	executeValidators: function(elementName, event, eventType){
		Object.each(this.formElements[elementName]['validators'], function(index){
			eval(index.validatorFunction); //Is there any way NOT to use eval here? Let me know
		}, this);
	},

	executeAllValidators: function(e){
		Object.each(this.formElements, function(item){ 
			this.executeValidators(item.elName, e, 'submit');
		}, this);
	},

	createErrorId: function(name, error){ 
		var errorString = error.capitalize();
		errorString = errorString.replace(/[^a-zA-Z0-9]+/g,'');
		var errorId = name + errorString;
		this.errorListIds[name].push(error);
		return errorId;
	},
	
	createErrorList: function(name){ 
		var errorList = new Element('ul', {
			'id': name+'ErrorList',
			'class': this.options.errorListClass
		});
		return errorList;
	},

	checkErrorList: function(errorList, errorId, name, element, label, error){ 
		if (errorList != null) { //If the error list exists
			var errorListId = errorList.get('id');
			var errorListElements = errorList.getElements('li[class='+this.options.errorListItemClass+']');
		
			if (errorListElements.length != 0){ //if errors exists with the errorListItemClass class  
				errorListElements.each(function(el){
					if (el.getProperty('id') == errorId) { //If the error matches the validation error, destroy it
						el.destroy();
						
					}
				});
				this.destroyErrorList(errorList, name, element, label);
			} else { //if no errors exist with the class of name
				this.destroyErrorList(errorList, name, element, label);				
			}
		} else { //The error list doesn't exist
			this.inputSuccess(element, label);
			this.enableSubmit();
		}
	},
	
	destroyErrorList: function(errorList, name, element, label){ //If the error list has no more children, destroy it
		var errorCheck = errorList.getElements('li[class='+this.options.errorListItemClass+']');
		if (this.options.errorDisplay == 'aboveForm'){
			if (errorCheck.length == 0) {
				errorList.destroy();
				this.inputSuccess(element, label);
				this.enableSubmit();
			} else {
				errorCheck = errorList.getElements('li[id^='+name+']');
				if (errorCheck.length == 0) { 
					this.inputSuccess(element, label);
				}
			}
		} else {
			if (errorCheck.length == 0) {
				errorList.destroy();
				this.inputSuccess(element, label);
				this.enableSubmit();
			}
		}
	},
	
	inputSuccess: function(element, label){ 
		if (element.hasClass(this.options.errorElement)) { element.removeClass(this.options.errorElement); }
		if (label.hasClass(this.options.errorLabel)) { label.removeClass(this.options.errorLabel); }

		label.addClass(this.options.successLabelClass);
		element.addClass(this.options.successElementClass);
	},
	
	enableSubmit: function(){ 
		if ((this.options.disableSubmit == true)&&($(this.form).getElements('li[class='+this.options.errorListItemClass+']').length == 0)){
			$(this.form).getElements('[type=submit]').removeProperty('disabled'); 
		}
	},
	
	success: function(name, element, label, error){
		var errorId = this.createErrorId(name, error);
		var errorList = $(name+'ErrorList');
		if (this.options.errorDisplay == 'aboveForm'){ errorList = $(this.form+'ErrorList'); }
		
		this.errorListIds[name] = [];
		this.checkErrorList(errorList, errorId, name, element, label, error);
	}, 
	
	error: function(name, element, label, error){
		var errorId = this.createErrorId(name, error);
		
		var errorMessage = new Element('li', {
			'id': errorId,									   
			'class': this.options.errorListItemClass,
			'html': error
		});
		
		if (element.hasClass(this.options.successElementClass)) { element.removeClass(this.options.successElementClass); }
		if (label.hasClass(this.options.successLabelClass)) { label.removeClass(this.options.successLabelClass); }

		label.addClass(this.options.errorLabel);
		element.addClass(this.options.errorElement);

		if (this.options.errorDisplay == 'aboveForm'){
			if ($(this.form + 'ErrorList')) { 
				var errorList = $(this.form + 'ErrorList');
			} else {
				var errorList = this.createErrorList(this.form);
				errorList.inject(this.form, 'before');
			}
		} else if (this.options.errorDisplay == 'aboveInput'){ 
			if ($(name+'ErrorList') != null) { 
				var errorList = $(name+'ErrorList');
			} else {
				var errorList = this.createErrorList(name);
				
				if (this.options.labelDisplay == 'before'){
					errorList.inject(label, 'before');
				} else if (this.options.labelDisplay == 'after'){
					errorList.inject(element, 'before');
				}
			}
		} else if (this.options.errorDisplay == 'belowInput'){
			if ($(name+'ErrorList') != null) {
				var errorList = $(name+'ErrorList');
			} else {
				var errorList = this.createErrorList(name);
				
				if (this.options.labelDisplay == 'before'){
					errorList.inject(element, 'after');
				} else if (this.options.labelDisplay == 'after'){
					errorList.inject(label, 'after');
				}
			}
		}

		var injectError = true;
		
		this.formElements[name]['passed']
		                                       
		if (!this.options.errorDisplayMultiple){
			injectError = (this.errorListIds[name].length == 1) ? true : false;
		} 
		if ((!$(errorId))&&(injectError)){ errorMessage.inject(errorList); }

		if (this.options.disableSubmit == true){
			$(this.form).getElements('[type=submit]').setProperty('disabled', 'true');
		}
	},//End error
	
	checkValid: function(valid, name, element, label, error){ 
		(valid) ? this.success(name, element, label, error) : this.error(name, element, label, error);
	},

	internalRegEx: function(regex, name, error){ 
		var element = $(this.form).getElement('[name='+name+']');
		var label = $(this.form).getElement('label[for='+name+']');
		var value = element.get('value').trim();
		var regexTest = new RegExp(regex);
		var valid = false;
		
		if (regexTest.test(value)) { valid = true; }
		this.checkValid(valid, name, element, label, error);
	},

	internalChecked: function(name, error, e, eventType){ //Only for radio and checkbox elements
		var element = $(this.form).getElement('[name='+name+']');
		var label = $(this.form).getElement('label[for='+name+']');
		var checked = false;
		
		if (element.get('type') == 'checkbox') {
			if (element.get('checked') == true){ checked = true; };
			this.checkValid(checked, name, element, label, error);
		} else {
			var elements = $(this.form).getElements('[name='+name+']');
			if ((eventType != 'submit') && ((Browser.firefox) || (Browser.opera))){
				/* Get the current element and detect event - Cross browser event detection and varied radio
				behavior make this entire block necessary - Special thanks to quirksmode for the syntax
				//*/
				var currentElement;
				if (!e) var e = window.event;
				if (e.target) {
					currentElement = e.target;
				} else if (e.srcElement) { 
					currentElement = e.srcElement;
				}
				if (currentElement.nodeType == 3) { currentElement = currentElement.parentNode; };
			
				var currentVal = currentElement.value;
				var lastVal = elements.getLast().get('value');
				
				if (currentVal == lastVal){
					elements.each(function(item){								  
						if (item.checked){ checked = true; };
					});
					this.checkValid(checked, name, currentElement, label, error);
				}
			} else {
				elements.each(function(item){
					if (item.checked){ checked = true; };
				});
				this.checkValid(checked, name, element, label, error);
			}			
		}
	},

	internalLength: function(name, error, type, length1, length2){ 
		var element = $(this.form).getElement('[name='+name+']');
		var label = $(this.form).getElement('label[for='+name+']');
		var value = element.get('value').trim().length;
		var valid = true;

		if (type == 'minLength'){
			if (value < length1){ valid = false; }	
		} else if (type == 'maxLength'){
			if (value > length1){ valid = false; }		
		} else if (type == 'range'){
			if ((value < length1) || (value > length2)){ valid = false; }
		}

		this.checkValid(valid, name, element, label, error);
	},

	internalCompare: function(name, compareName, error, type){ 
		var element = $(this.form).getElement('[name='+name+']');
		var element2 = $(this.form).getElement('[name='+compareName+']');
		var label = $(this.form).getElement('label[for='+name+']');
		var value = element.get('value').trim();
		var value2 = element2.get('value').trim();
		var valid = true;

		if (type == 'matches'){
			if (value != value2){ valid = false; }	
		} else if (type == 'noMatches'){
			if (value == value2){ valid = false; }		
		} 

		this.checkValid(valid, name, element, label, error);
	},

	internalArray: function(name, error, type, arrayCheck){ 
		var element = $(this.form).getElement('[name='+name+']');
		var label = $(this.form).getElement('label[for='+name+']');
		var value = element.get('value').trim();
		
		if (type == 'includes'){
			var valid = false;
			arrayCheck.each(function(item){
				var regexTest = new RegExp(item);			
				if (regexTest.test(value)){ valid = true; }
			});
		} else if (type == 'excludes'){
			var valid = true;
			arrayCheck.each(function(item){
				var regexTest = new RegExp(item);			
				if (regexTest.test(value)){ valid = false; }
			});		
		} 
		
		this.checkValid(valid, name, element, label, error);		
	},
	
	//Everything from here down is a public method, beginning with the essential methods
	validateRegEx: function(regex, name, error){
		var vFunction = 'this.internalRegEx(\''+regex+'\', \''+name+'\', \''+error+'\');';
		this.setValidator(name, regex, vFunction, error);
	},

	required: function(name, error){
		if (!error){ error = "This field is required."; }
		var element = $(this.form).getElements('[name='+name+']');
		var type = element.getProperty('type');

		regexTest = new RegExp('radio');

		if ((regexTest.test(type)) || (type == 'checkbox')){
			var vFunction = 'this.internalChecked(\''+name+'\', \''+error+'\', event, eventType);';
			this.setValidator(name, 'required', vFunction, error);
		} else {
			this.validateRegEx('[^\S]', name, error);
		}
	},

	minLength: function(name, minLength, error){
		if (!error){ error = 'This field must contain at least '+minLength+' characters.'; }
		var vFunction = "this.internalLength('"+name+"', '"+error+"', 'minLength', "+minLength+");";
		this.setValidator(name, 'minLength', vFunction, error);
	},
	
	maxLength: function(name, maxLength, error){
		if (!error){ error = 'This field may contain no more than '+maxLength+' characters.'; }
		var vFunction = "this.internalLength('"+name+"', '"+error+"', 'maxLength', "+maxLength+");";
		this.setValidator(name, 'maxLength', vFunction, error);
	},
	
	range: function(name, minLength, maxLength, error){
		if (!error){ error = 'This field must contain at least '+minLength+' and no more than '+maxLength+' characters.'; }
		var vFunction = "this.internalLength('"+name+"', '"+error+"', 'range', "+minLength+", "+maxLength+");";
		this.setValidator(name, 'range', vFunction, error);
	},

	matches: function(name, compareName, error){
		if (!error){ error = 'This field does not match the '+compareName+' field.'; }
		var vFunction = "this.internalCompare('"+name+"', '"+compareName+"', '"+error+"', 'matches');";
		this.setValidator(name, 'matches', vFunction, error);
	},
	
	noMatches: function(name, compareName, error){
		if (!error){ error = 'This field cannot match the '+compareName+' field.'; }
		var vFunction = "this.internalCompare('"+name+"', '"+compareName+"', '"+error+"', 'noMatches');";
		this.setValidator(name, 'noMatches', vFunction, error);
	},	

	includes: function(name, arrayCheck, error){
		if (!error){ error = "This field did not contain any of the following values: "+arrayCheck.join(', ')+"."; }
		var vFunction = "this.internalArray('"+name+"', '"+error+"', 'includes', ['"+arrayCheck.join("', '")+"']);";
		this.setValidator(name, 'includes', vFunction, error);
	},
	
	excludes: function(name, arrayCheck, error){
		if (!error){ error = "This field cannot contain any of the following values: "+arrayCheck.join(', ')+"."; }
		var vFunction = "this.internalArray('"+name+"', '"+error+"', 'excludes', ['"+arrayCheck.join("', '")+"']);";
		this.setValidator(name, 'excludes', vFunction, error);
	},	

	addFunction: function(name, customFunction){
		this.setValidator(name, customFunction, customFunction);
	},
	
	//Any or all the following methods are common shortcuts that are based on the essential methods above
	alpha: function(name, error){
		if (!error){ error = "This field may contain only letters."; }
		this.validateRegEx('^[a-zA-Z]+$', name, error);
	},
	
	numeric: function(name, error){
		if (!error){ error = "This field may contain only numbers."; }
		this.validateRegEx('^[0-9]+$', name, error);
	},

	alphanumeric: function(name, error){
		if (!error){ error = "This field may contain only letters or numbers."; }
		this.validateRegEx('^[a-zA-Z0-9]+$', name, error);
	},

	email: function(name, error){
		if (!error){ error = "Please enter a valid email address."; }
		this.validateRegEx('^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$', name, error);
	},
	
	url: function(name, error){
		if (!error){ error = "Please enter a valid URL."; }
		this.validateRegEx('^((http|https|ftp)://)?([[:alnum:]\-\.])+(\.)([[:alnum:]]){2,4}([[:alnum:]/+=%&_\.~?\-]*)$', name, error);
	},

	password: function(name, error){
		if (!error){ error = "Your password must contain one lowercase letter, one uppercase letter, one number, and be at least 6 characters long."; }
		this.validateRegEx("(?=^.{6,}$)((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.*", name, error);
	},

	usZip: function(name, error){
		if (!error){ error = "Please enter a valid US ZIP Code."; }
		this.validateRegEx('^[0-9]{5}(?:-[0-9]{4})?$', name, error);
	},
	
	canadaPostal: function(name, error){
		if (!error){ error = "Please enter a valid Canadian Postal Code."; }
		this.validateRegEx('^[ABCEGHJKLMNPRSTVXY][0-9][A-Z] [0-9][A-Z][0-9]$', name, error);
	},

	credit: function(name, error){ //Validates all major credit cards
		if (!error){ error = "Please enter a valid credit card number."; }
		this.validateRegEx('^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6011[0-9]{12}|3(?:0[0-5]|[68][0-9])[0-9]{11}|3[47][0-9]{13})$', name, error);
	},
	
	dateMDY: function(name, error){
		if (!error){ error = "Please enter a valid date in M/D/Y format."; }
		this.validateRegEx('^(0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)?[0-9]{2}$', name, error);
	},
	
	dateYMD: function(name, error){
		if (!error){ error = "Please enter a valid date in Y/M/D format."; }
		this.validateRegEx('^(19|20)?[0-9]{2}[- /.](0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])$', name, error);
	},
	
	swearFilter: function(name, error){
		if (!error){ error = "Please refrain from using profanity."; }
		this.excludes(name, [' fuck ', ' fuk ', ' fuc ', ' shit ', ' bitch ', ' cunt ', ' damn ', ' damm '], error);
	},

	imageFile: function(name, error){
		if (!error){ error = "Please upload a valid image file. Valid files end with one of the following extensions: .jpg, .jpeg, .bmp, .gif, .png."; }
		this.validateRegEx('\.jpg|jpeg|bmp|gif|png$', name, error);
	},
	
	phone: function(name, error){ //This is for North American phone numbers only
		if (!error){ error = "Please enter a valid phone number including area code."; }
		this.validateRegEx('^(([0-9]{1})*[- .(]*([0-9]{3})[- .)]*[0-9]{3}[- .]*[0-9]{4})+$', name, error);
	}
});