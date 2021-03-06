import * as React from 'react';
import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TextInputProps,
    NativeSyntheticEvent,
    TextInputEndEditingEventData,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { styles } from './styles';
import { validators, Validators } from './validators';

export interface ReactNativeInput extends TextInputProps {
    onChangeText: (val?: string, err?: boolean) => void;
    validators?: Validators[];
    errorViewStyles?: StyleProp<ViewStyle>;
    errorTextStyles?: StyleProp<TextStyle>;
    errorMessage?: string;
    validateOn?: 'start-editing' | 'end-editing' | 'never';
}

const Input: React.FC<ReactNativeInput> = ({
    style,
    onChangeText,
    value,
    validators: validatorTypes = [],
    errorViewStyles,
    errorTextStyles,
    errorMessage: errorMsg,
    validateOn = 'end-editing',
    ...rest
}) => {
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const validateInput = (val: string) => {
        if (validatorTypes.length > 0) {
            const validations = validatorTypes.map(type => {
                const currentValidator = validators[type];
                return currentValidator(val);
            });
            const result = validations.reduce((prev, cur) => {
                /* return failed validation if any one validation fails */
                return {
                    result: prev.result && cur.result,
                    reason: !prev.result ? prev.reason : cur.reason,
                };
            });
            return result;
        }
        return {
            result: true,
            reason: 'All validations passed',
        };
    };
    const handleSuccess = () => {
        setHasError(false);
        setErrorMessage('');
    };
    const handleError = (error: string) => {
        setErrorMessage(error);
        setHasError(true);
    };
    const handleChange = (val: string) => {
        const validation = validateInput(val);
        if (validateOn == 'start-editing') {
            if (!validation.result) {
                handleError(validation.reason);
            } else {
                handleSuccess();
            }
        }
        if (onChangeText != undefined) {
            onChangeText(val, !validation.result);
        }
        return;
    };
    const handleBlur = (evt: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
        if (validateOn == 'end-editing') {
            const validation = validateInput(evt.nativeEvent.text);
            if (validation.result) {
                handleSuccess();
            } else {
                handleError(validation.reason);
            }
        }
        return;
    };

    return (
        <>
            <TextInput
                onChangeText={handleChange}
                onEndEditing={handleBlur}
                value={value}
                {...rest}
                style={[styles.defaultInput, style]}
            />
            {hasError && (
                <View style={[styles.defaultError, errorViewStyles]}>
                    <Text style={[styles.defaultErrorText, errorTextStyles]}>
                        {errorMsg || errorMessage}
                    </Text>
                </View>
            )}
        </>
    );
};

export default Input;
