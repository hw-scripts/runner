class TemplateRenderer {
	constructor(template, evaluate) {
		this.template = template;
		this.evaluate = evaluate;
	}

	render() {
		const template = document.createElement('template');
		template.innerHTML = this.template;

		const fragment = template.content;

		// 1. Tag-specific DOM transformations
		this.renderOverrides(fragment);

		// 2. General {{ ... }} processing
		this.renderExpressions(fragment, this.evaluate);

		// 3. Tag-specific finalisation
		this.renderFinalisations(fragment);

		return fragment;
	}

	renderOverrides(root) {
		this.renderTagMethods(root, 'Override');
	}

	renderFinalisations(root) {
		this.renderTagMethods(root, 'Finalisation');
	}

	renderTagMethods(root, suffix) {
		const processed = new WeakSet();

		while (true) {
			let element = null;

			/*
			 * DOM is queried again on every iteration,
			 * so newly created elements participate
			 * in the same pass.
			 */
			for (const candidate of root.querySelectorAll('*')) {
				if (!processed.has(candidate)) {
					element = candidate;
					break;
				}
			}

			if (!element)
				break;

			processed.add(element);

			const method =
				this[element.tagName.toLowerCase() + suffix];

			if (typeof method === 'function')
				method.call(this, element);
		}
	}

	optionsOverride(options) {
		const forExpr = options.getAttribute('for');

		if (!forExpr)
			return;

		const attributes = [...options.attributes]
			.filter(attribute => attribute.name !== 'for');

		const content = options.innerHTML;

		this.evaluate(`
			for (const ${forExpr}) {
				callback(code => eval(code));
			}
		`, localEvaluate => {
			const option = document.createElement('option');

			for (const attribute of attributes)
				option.setAttribute(
					attribute.name,
					attribute.value
				);

			option.innerHTML = content;

			this.renderAttributes(option, localEvaluate);
			this.renderExpressions(option, localEvaluate);

			options.before(option);
		});

		options.remove();
	}

	selectFinalisation(select) {
		if (select.hasAttribute('value'))
			select.value = select.getAttribute('value');
	}

	renderExpressions(root, evaluate) {
		const walker = document.createTreeWalker(
			root,
			NodeFilter.SHOW_ELEMENT |
			NodeFilter.SHOW_TEXT
		);

		let node;

		while ((node = walker.nextNode())) {
			if (node.nodeType === Node.TEXT_NODE)
				node.nodeValue =
					this.renderExpression(node.nodeValue, evaluate);

			else
				this.renderAttributes(node, evaluate);
		}
	}

	renderAttributes(element, evaluate) {
		for (const attribute of element.attributes)
			attribute.value =
				this.renderExpression(attribute.value, evaluate);
	}

	renderExpression(text, evaluate) {
		return text.replace(
			/\{\{(.*?)\}\}/gs,
			(match, expression) =>
				evaluate(expression.trim())
		);
	}
}


Element.prototype.appendTemplate = function (template, evaluate) {
	const renderer = new TemplateRenderer(template, evaluate);
	this.append(renderer.render());
};