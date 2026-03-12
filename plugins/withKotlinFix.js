const { withGradleProperties } = require('expo/config-plugins');

module.exports = function withKotlinFix(config) {
  return withGradleProperties(config, (config) => {
    // Force Kotlin 1.9.25 and suppress Compose version check
    const props = config.modResults;
    
    // Remove existing kotlin.version if present
    const existingIdx = props.findIndex(p => p.type === 'property' && p.key === 'kotlin.version');
    if (existingIdx >= 0) props.splice(existingIdx, 1);
    
    // Add Kotlin version
    props.push({
      type: 'property',
      key: 'kotlin.version',
      value: '1.9.25',
    });
    
    // Suppress Compose Kotlin version compatibility check
    props.push({
      type: 'property', 
      key: 'android.suppressKotlinVersionCompatibilityCheck',
      value: 'true',
    });
    
    return config;
  });
};
