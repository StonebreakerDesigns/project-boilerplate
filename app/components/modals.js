/** Modals. */
import { Component, h } from 'preact';
import bound from 'autobind-decorator';

import styled from '../bind-style';
import { Icon } from './primitives';
import style from './modals.less';

/** A modal populated with the provided children. */
@styled(style)
class Modal extends Component {
	constructor(props) {
		super(props);

		this.state = { open: false };
	}

	componentWillMount() {
		this.props.binding(this);
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

	render({ top, children }, { open }) { return open && (
		<div onClick={ this.close } class={ 
			'modal-container' + (top ? ' top' : '') 
		} >
			<div class="modal" onClick={ e => e.stopPropagation() }>
				<Icon name="times" class="modal-exit" onClick={ this.close }/>
				{ children }
			</div>
		</div>
	); }
}

export { Modal };
