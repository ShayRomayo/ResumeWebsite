namespace CodingShowcase.Shared;

public class StateContainer
{
    private string? _savedString;
    private int? _counter;
    private int[,]? _board;
    private int? _multiplesScore;
    private bool? _multiplesGameOver;

    public int[,] Board
    {
        get => _board ?? new int[4,4];

        set
        {
            _board = value;
            NotifyStateChanged();
        }
    }

    public int MultiplesScore
    {
        get => _multiplesScore ?? 0;

        set
        {
            _multiplesScore = value;
            NotifyStateChanged();
        }
    }

    public bool MultiplesGameOver
    {
        get => _multiplesGameOver ?? false;

        set
        {
            _multiplesGameOver = value;
            NotifyStateChanged();
        }
    }
    public string Property
    {
        get => _savedString ?? string.Empty;
        set
        {
            _savedString = value;
            NotifyStateChanged();
        }
    }

    public int Count
    {
        get => _counter ?? 0;
        set
        {
            _counter = value;
            NotifyStateChanged();
        }
    }

    public event Action? OnChange;

    private void NotifyStateChanged() => OnChange?.Invoke();
}