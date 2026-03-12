const { withGradleProperties } = require('expo/config-plugins');

module.exports = function withKotlinFix(config) {
  return withGradleProperties(config, (config) => {
    const props = config.modResults;
    
    // Suppress Compose Kotlin version compatibility check
    // This tells Compose Compiler to accept Kotlin 1.9.24 even though it expects 1.9.25
    const suppressKey = 'kotlin.suppressKotlinVersionCompatibilityCheck';
    const existingSuppress = props.findIndex(p => p.type === 'property' && p.key === suppressKey);
    if (existingSuppress >= 0) {
      props[existingSuppress].value = 'true';
    } else {
      props.push({
        type: 'property',
        key: suppressKey,
        value: 'true',
      });
    }
    
    return config;
  });
};
