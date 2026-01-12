import {
  Badge,
  Box,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import type { FormField } from "@/types/form";

function fieldKey(field: FormField, idx: number): string {
  return `${field.type}:${field.label || "field"}:${idx}`;
}

function asString(v: any): string {
  if (v == null) return "";
  return typeof v === "string" ? v : JSON.stringify(v);
}

export function HubFormPreview({
  fields,
  title,
  description,
}: {
  fields: FormField[];
  title?: string;
  description?: string;
}): JSX.Element {
  const panelBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const labelBg = useColorModeValue("gray.50", "gray.900");

  return (
    <Box border="1px" borderColor={border} borderRadius="md" bg={panelBg} p={4}>
      <VStack align="stretch" spacing={4}>
        {title ? (
          <VStack align="stretch" spacing={1}>
            <Text fontWeight="bold">{title}</Text>
            {description ? (
              <Text fontSize="sm" color="gray.500">
                {description}
              </Text>
            ) : null}
          </VStack>
        ) : null}

        <VStack align="stretch" spacing={3}>
          {(fields || []).map((field, idx) => {
            const required = !!field.required;
            const label = field.label || `Field ${idx + 1}`;
            const placeholder = field.placeholder ?? undefined;
            const mapped = field.mapped_variable ?? null;

            if (field.type === "label") {
              return (
                <Box key={fieldKey(field, idx)} p={2} borderRadius="md" bg={labelBg}>
                  <Text fontWeight="semibold">{label}</Text>
                </Box>
              );
            }

            const labelRight = (
              <HStack spacing={2}>
                {required ? (
                  <Badge colorScheme="red" variant="subtle">
                    required
                  </Badge>
                ) : null}
                {mapped ? (
                  <Badge colorScheme="purple" variant="outline">
                    ↳ {mapped}
                  </Badge>
                ) : null}
              </HStack>
            );

            // Defaults (read-only preview)
            const defaultScalar =
              typeof field.default_value === "string"
                ? field.default_value
                : (field.default_value?.[0] ?? "");
            const defaultArray = Array.isArray(field.default_value) ? field.default_value : [];

            return (
              <FormControl key={fieldKey(field, idx)} isRequired={required} isDisabled>
                <HStack align="baseline" justify="space-between">
                  <FormLabel mb={1}>{label}</FormLabel>
                  {labelRight}
                </HStack>

                {field.type === "text" ? (
                  <Input value={defaultScalar} placeholder={placeholder} readOnly />
                ) : field.type === "number" ? (
                  <Input type="number" value={defaultScalar} placeholder={placeholder} readOnly />
                ) : field.type === "textarea" ? (
                  <Textarea value={defaultScalar} placeholder={placeholder} readOnly />
                ) : field.type === "date" ? (
                  <Input type="date" value={defaultScalar} readOnly />
                ) : field.type === "time" ? (
                  <Input type="time" value={defaultScalar} readOnly />
                ) : field.type === "file" ? (
                  <Input type="file" readOnly />
                ) : field.type === "checkbox" ? (
                  <VStack align="start" spacing={2}>
                    {(field.options || []).length > 0 ? (
                      <Stack spacing={1}>
                        {(field.options || []).map((opt) => (
                          <Checkbox
                            key={opt.value}
                            isChecked={defaultArray.includes(opt.value)}
                            isDisabled>
                            {opt.label}
                          </Checkbox>
                        ))}
                      </Stack>
                    ) : (
                      <Checkbox
                        isChecked={defaultScalar === "true" || defaultScalar === "1"}
                        isDisabled>
                        {placeholder || "Checked"}
                      </Checkbox>
                    )}
                  </VStack>
                ) : field.type === "radio" ? (
                  <RadioGroup value={defaultScalar}>
                    <Stack direction="column">
                      {(field.options || []).map((opt) => (
                        <Radio key={opt.value} value={opt.value} isDisabled>
                          {opt.label}
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                ) : field.type === "select" ? (
                  <Select value={defaultScalar} placeholder={placeholder} isDisabled>
                    {(field.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input value={asString(field.default_value)} placeholder={placeholder} readOnly />
                )}

                {placeholder ? (
                  <FormHelperText fontSize="xs">Placeholder: {placeholder}</FormHelperText>
                ) : null}
              </FormControl>
            );
          })}
        </VStack>
      </VStack>
    </Box>
  );
}
