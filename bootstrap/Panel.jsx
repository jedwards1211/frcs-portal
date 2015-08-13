import addClass from '../wrappers/addClass';
import Collapse from './Collapse';

var Panel = addClass('div', 'panel panel-default');
Panel.Primary = addClass('div', 'panel panel-primary');
Panel.Info = addClass('div', 'panel panel-info');
Panel.Success = addClass('div', 'panel panel-success');
Panel.Warning = addClass('div', 'panel panel-warning');
Panel.Danger = addClass('div', 'panel panel-danger');
Panel.Heading = addClass('div', 'panel-heading');
Panel.Title = addClass('h3', 'panel-title');
Panel.Body = addClass('div', 'panel-body');
Panel.Collapse = addClass(Collapse, 'panel-collapse');
Panel.Footer = addClass('div', 'panel-footer');

export default Panel;