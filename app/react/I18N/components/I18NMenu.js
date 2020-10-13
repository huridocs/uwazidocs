import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Icon } from 'UI';
import { NeedAuthorization } from 'app/Auth';
import { actions, t } from 'app/I18N';
import DropdownList from 'app/Forms/components/DropdownList';

class I18NMenu extends Component {
  
  render() {
    const { languages, locale, location, i18nmode, toggleInlineEdit } = this.props;

    let path = location.pathname;
    const regexp = new RegExp(`^/?${locale}/|^/?${locale}$`);
    path = path.replace(regexp, '/');

    const languageOptions = languages.map(lang => {
      const key = lang.get('key');
      const label = lang.get('label');
      const url = `/${key}${path}${path.match('document') ? '' : location.search}`;
      return {
        _id: key,
        type: 'text',
        label,
        url,
      };
    });
    languageOptions.sort((a, b) => a.label.localeCompare(b.label));
    
    return (
      <ul className="menuNav-I18NMenu" role="navigation" aria-label="Languages">
        <NeedAuthorization roles={['admin', 'editor']}>
          <button
            className={`menuNav-btn btn btn-default${i18nmode ? ' inlineEdit active' : ''}`}
            type="button"
            onClick={toggleInlineEdit}
            aria-label={t('System', 'Add/edit translations', null, false)}
          >
            <Icon icon="language" size="lg" />
          </button>
        </NeedAuthorization>
        {languageOptions.count() > 1 && (
          <div className="list-view-mode">
            <div className="hidden-columns-dropdown">
              <DropdownList
                valueField="_id"
                textField="label"
                data={languageOptions}
                placeholder="Choose language"
              />
            </div>
          </div>
        )}
      </ul>
    );
  }
}

I18NMenu.defaultProps = {
  locale: null,
};

I18NMenu.propTypes = {
  location: PropTypes.instanceOf(Object).isRequired,
  languages: PropTypes.instanceOf(Object).isRequired,
  toggleInlineEdit: PropTypes.func.isRequired,
  i18nmode: PropTypes.bool.isRequired,
  locale: PropTypes.string,
};

export function mapStateToProps(state) {
  return {
    languages: state.settings.collection.get('languages'),
    i18nmode: state.inlineEdit.get('inlineEdit'),
    locale: state.locale,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ toggleInlineEdit: actions.toggleInlineEdit }, dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(I18NMenu));
