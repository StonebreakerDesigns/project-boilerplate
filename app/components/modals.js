/** Modals. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import { Button } from './primitives';

/** A modal populated with the provided children. */
class Modal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			//	Whether this modal is open.
			open: false
		};
	}

	/** Open this modal. */
	@bound
	open() { this.setState({open: true}); }
	/** Close this modal. */
	@bound
	close(event=null) { 
		this.setState({open: false});

		if (event) event.stopPropagation();
	}

	render({ top, children }) { return this.state.open && (
		<div onClick={ this.close } class={ 
			'modal-container' + (top ? ' top' : '') 
		} >
			<div class="modal" onClick={ e => e.stopPropagation() }>
				<i onClick={ this.close } title="Close" class=
					"fa fa-times modal-close" 
				/>
				{ children }
			</div>
		</div>
	); }
}

/** A confirmation modal. */
class ConfirmModal extends Component {
	constructor(props) {
		super(props);

		this.nullState = {
			//	The current message.
			message: null,
			//	The current confirmation callback.
			callback: null
		};
		this.state = this.nullState;
	}

	/** 
	*	Asynchronously perform a confirmation, returning a boolean value.
	*	@param message The question to ask the user.
	*/
	confirm(message) {
		return new Promise(resolve => {
			this.setState({
				message: message,
				callback: resolve
			});
			this.modal.open();
		});
	}
	/** Handle confirmation. */
	@bound
	handleConfirmed() {
		this.state.callback(true);
		this.close();

		this.setState(this.nullState);
	}
	/** Handle cancel or backout. */
	@bound
	close() {
		this.modal.close();
		if (this.state.callback) {
			this.state.callback(false);
		}

		this.setState(this.nullState);
	}

	render({}, { message }) { return (
		<Modal ref={ m => this.modal = m } top={ true }>
			<h4>Are you sure?</h4>
			<p class="pad-v">{ message }</p>
			<div class="al-right">
				<Button label="Cancel" onClick={ this.close } type="warn"/>
				<Button label="Confirm" onClick={ this.handleConfirmed }/>
			</div>
		</Modal>
	); }
}

export { Modal, ConfirmModal };
