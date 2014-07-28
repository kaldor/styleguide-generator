/*global $, Mustache, ZeroClipboard*/
(function( window, document, $, Mustache, undefined ) {
  'use strict';

  window.StyleguideGenerator = function( options ) {

    function getLocationHash() {
      return window.location.hash.substring( 1 );
    }

    function handleError( e ) {
      console.error( e.message );
    }

    var selector = ( options && options.el ) || '.styleguide',

      target = $( selector ),

      components = options.components,

      data = options.data,

      componentToIsolate = getLocationHash(),

      partials = {},

      dom = {},

      IS_HIDDEN_CLASS = 'sg-is-hidden',

      COMPONENT_NAMESPACE = 'sg-component',

      getComponentPartialString = function( component ) {
        return '{{> ' + component.name + '}}';
      },

      setComponentPartialProp = function( component ) {
        component.partial = getComponentPartialString( component );
      },

      isolateComponent = function() {
        componentToIsolate = getLocationHash();
        if ( componentToIsolate ) {
          dom.components.not( '[data-is-component="' + componentToIsolate + '"]')
            .addClass( IS_HIDDEN_CLASS );
        } else {
          dom.components.removeClass( IS_HIDDEN_CLASS );
        }
      },

      loadTemplate = function( name ) {
        return $.ajax({
          url: 'templates/' + name + '.mustache'
        }).done(function( tmpl ) {
          partials[ name ] = tmpl;
        });
      },

      loadTemplates = function() {
        var names = components.map(function( component ) {
          return component.name;
        });
        return names.map( loadTemplate );
      },

      render = function() {
        $.when( loadTemplate( 'components' ) )
          .then( function( template ) {
            template = Mustache.render( template, components );
            var rendered = Mustache.render( template, data, partials );
            target.html( rendered );
            cacheDOM();
            initZeroClipboard();
            if ( componentToIsolate ) {
              isolateComponent();
            }
          });
      },

      cacheDOM = function() {
        dom.components = $( '.' + COMPONENT_NAMESPACE );
        dom.copyMarkupButtons = $( '.' + COMPONENT_NAMESPACE + '__copy-markup-button' );
      },

      bindEvents = function() {
        $( window ).on( 'hashchange', isolateComponent );
      },

      initZeroClipboard = function() {
        new ZeroClipboard( dom.copyMarkupButtons );
      },

      init = function() {
        components.forEach( setComponentPartialProp );
        bindEvents();
        initZeroClipboard();
        $.when.apply( $, loadTemplates() )
          .then( render )
          .fail( handleError );
      };

    init();

  };
})( window, document, $, Mustache );