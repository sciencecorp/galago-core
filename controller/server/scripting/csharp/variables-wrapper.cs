using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

/// <summary>
/// A wrapper class that provides methods for managing variables through API calls
/// </summary>
public class VariablesWrapper
{
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;

    public VariablesWrapper(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _apiUrl = "http://db:8000"; // Using the docker container hostname
    }

    /// <summary>
    /// Get a variable by name
    /// </summary>
    /// <param name="name">The name of the variable to retrieve</param>
    /// <returns>The retrieved variable data</returns>
    public async Task<JsonElement?> GetVariableAsync(string name)
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_apiUrl}/variables/{name}");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<JsonElement>(content);
            }
            else if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Console.WriteLine($"Resource with name {name} not found in variables.");
                return null;
            }
            else
            {
                throw new HttpRequestException($"Error retrieving variable {name}: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in GetVariableAsync: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Get all variables
    /// </summary>
    /// <returns>All variables data</returns>
    public async Task<JsonElement> GetAllVariablesAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_apiUrl}/variables");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(content);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in GetAllVariablesAsync: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Create a new variable
    /// </summary>
    /// <param name="data">The variable data to create</param>
    /// <returns>The created variable data</returns>
    public async Task<JsonElement> CreateVariableAsync(object data)
    {
        try
        {
            var json = JsonSerializer.Serialize(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{_apiUrl}/variables", content);
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(responseContent);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in CreateVariableAsync: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Update a variable by name
    /// </summary>
    /// <param name="name">The name of the variable to update</param>
    /// <param name="newValue">The new value for the variable</param>
    /// <returns>The updated variable data</returns>
    public async Task<JsonElement> UpdateVariableAsync(string name, object newValue)
    {
        try
        {
            var variable = new { value = newValue };
            var json = JsonSerializer.Serialize(variable);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PutAsync($"{_apiUrl}/variables/{name}", content);
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(responseContent);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in UpdateVariableAsync: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Delete a variable by name
    /// </summary>
    /// <param name="name">The name of the variable to delete</param>
    /// <returns>The response from the delete operation</returns>
    public async Task<JsonElement> DeleteVariableAsync(string name)
    {
        try
        {
            var response = await _httpClient.DeleteAsync($"{_apiUrl}/variables/{name}");
            response.EnsureSuccessStatusCode();
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<JsonElement>(content);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error in DeleteVariableAsync: {ex.Message}");
            throw;
        }
    }
}