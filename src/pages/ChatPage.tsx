import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { chatApi } from "@/api/chatApi";
import { bookingApi } from "@/api/bookingApi";
import { useAuthStore } from "@/stores/authStore";
import { getSocket, connectSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

interface Message {
  _id?: string;
  sender: string;
  message: string;
  createdAt?: string;
}

interface ChatBooking {
  _id: string;
  service?: { title?: string };
  provider?: { name?: string };
  customer?: { name?: string };
  user?: { name?: string };
  status: string;
}

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const bookingId = searchParams.get("booking") || "";
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatBookings, setChatBookings] = useState<ChatBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [chatClosed, setChatClosed] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load all bookings for the chat list
  const loadBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const isProvider = user?.role === "ServiceProvider";
      const res = isProvider
        ? await bookingApi.getProviderBookings()
        : await bookingApi.getUserBookings();
      const allBookings: ChatBooking[] = res.data.bookings || res.data || [];
      // Show all non-cancelled bookings in chat list
      setChatBookings(allBookings.filter((b) => b.status !== "cancelled"));
    } catch {
      setChatBookings([]);
    }
    setLoadingBookings(false);
  }, [user?.role]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (!bookingId) return;
    loadChat();
    if (user?.id) {
      connectSocket(user.id);
      const socket = getSocket();
      socket.on("newMessage", (msg: Message) => setMessages((prev) => [...prev, msg]));
      return () => { socket.off("newMessage"); };
    }
  }, [bookingId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChat = async () => {
    setLoading(true);
    setChatClosed(false);
    try {
      const res = await chatApi.getOrCreate(bookingId);
      setMessages(res.data.chat?.messages || res.data.messages || []);
      // Check if booking is completed
      const booking = chatBookings.find((b) => b._id === bookingId);
      if (booking?.status === "completed") {
        setChatClosed(true);
      }
    } catch {
      toast({ title: "Could not load chat", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || chatClosed) return;
    try {
      await chatApi.sendMessage(bookingId, { message: text });
      setMessages((prev) => [...prev, { sender: user?.id || "", message: text }]);
      setText("");
    } catch {
      toast({ title: "Failed to send", variant: "destructive" });
    }
  };

  const selectBooking = (id: string) => {
    setSearchParams({ booking: id });
  };

  const getBookingLabel = (b: ChatBooking) => {
    const name = user?.role === "ServiceProvider"
      ? (b.customer?.name || b.user?.name || "Customer")
      : (b.provider?.name || "Provider");
    return { title: b.service?.title || "Service", name };
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-lg border border-border bg-card overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className="w-64 border-r border-border flex flex-col shrink-0 max-md:hidden">
        <div className="px-3 py-2.5 border-b border-border">
          <h3 className="text-xs font-semibold text-foreground">Conversations</h3>
          <p className="text-[10px] text-muted-foreground">{chatBookings.length} chats</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingBookings ? (
            <div className="flex justify-center py-6">
              <Icon icon="svg-spinners:ring-resize" className="h-4 w-4 text-primary" />
            </div>
          ) : chatBookings.length === 0 ? (
            <p className="text-[10px] text-muted-foreground text-center py-6">No conversations</p>
          ) : (
            chatBookings.map((b) => {
              const { title, name } = getBookingLabel(b);
              const isActive = b._id === bookingId;
              const isClosed = b.status === "completed";
              return (
                <button
                  key={b._id}
                  onClick={() => selectBooking(b._id)}
                  className={`w-full text-left px-3 py-2.5 border-b border-border transition-colors ${
                    isActive ? "bg-primary/10" : "hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-foreground truncate">{title}</p>
                    {isClosed && (
                      <span className="text-[9px] bg-muted text-muted-foreground px-1 py-0.5 rounded shrink-0 ml-1">Closed</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{name}</p>
                  <span className={`text-[9px] rounded px-1 py-0.5 font-medium mt-0.5 inline-block ${
                    b.status === "completed" ? "bg-primary/10 text-primary" :
                    b.status === "in_progress" ? "bg-accent/10 text-accent-foreground" :
                    b.status === "accepted" ? "bg-info/10 text-info" :
                    "bg-warning/10 text-warning"
                  }`}>
                    {b.status === "in_progress" ? "In Progress" : b.status}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!bookingId ? (
          <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
            <Icon icon="solar:chat-round-dots-bold-duotone" className="mb-3 h-12 w-12 text-border" />
            <p className="text-sm font-medium">Select a conversation</p>
            <p className="text-xs mt-1">Choose a booking from the sidebar to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
              {/* Mobile back button */}
              <button
                onClick={() => setSearchParams({})}
                className="md:hidden h-6 w-6 flex items-center justify-center rounded hover:bg-secondary transition-colors"
              >
                <Icon icon="solar:arrow-left-bold" className="h-4 w-4 text-foreground" />
              </button>
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Icon icon="solar:chat-round-dots-bold" className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-semibold text-foreground truncate">
                  {chatBookings.find((b) => b._id === bookingId)?.service?.title || "Chat"}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {chatClosed ? "This chat is closed (service completed)" : `Booking: ${bookingId.slice(0, 8)}...`}
                </p>
              </div>
              {chatClosed && (
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded font-medium">
                  Closed
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Icon icon="svg-spinners:ring-resize" className="h-5 w-5 text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <p className="py-10 text-center text-xs text-muted-foreground">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender === user?.id;
                  return (
                    <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-lg px-3 py-2 text-xs ${
                        isMe ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}>
                        {msg.message}
                        {msg.createdAt && (
                          <p className={`text-[9px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {chatClosed ? (
              <div className="border-t border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">This chat is closed because the service has been completed.</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2">
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." className="flex-1 h-8 text-xs" />
                <Button type="submit" size="sm" className="h-8 px-3">
                  <Icon icon="solar:plain-bold" className="h-3.5 w-3.5" />
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
