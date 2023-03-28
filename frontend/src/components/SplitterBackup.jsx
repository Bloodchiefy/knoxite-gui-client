import { cn } from '../utils/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'react-bootstrap';

const SplitterBackup = ({
  id = 'drag-bar-backup',
  dir,
  isDragging,
  onClick,
  store,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      id={id}
      data-testid={id}
      tabIndex={0}
      className={cn(
        'drag-bar',
        dir === 'horizontal' && 'drag-bar--horizontal',
        'drag-bar--dragging'
      )}
      {...props}
    >
      <div className='store-restore-btns no-user-select'>
        <Button variant='dark' className='no-user-select' onClick={store}>
          <FontAwesomeIcon className='no-user-select' icon={faArrowRight} />
        </Button>
        <br />
        <br />
        <Button variant='dark' className='no-user-select'>
          <FontAwesomeIcon className='no-user-select' icon={faArrowLeft} />
        </Button>
      </div>
    </div>
  );
};

export default SplitterBackup;
